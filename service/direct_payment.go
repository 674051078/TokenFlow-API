package service

import (
	"bytes"
	"context"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting"
)

const (
	wechatPayAPIBase = "https://api.mch.weixin.qq.com"
	alipayGateway    = "https://openapi.alipay.com/gateway.do"
)

type WeChatNativeOrder struct {
	CodeURL string
}

type WeChatPaymentNotification struct {
	AppID      string
	MchID      string
	OutTradeNo string
	TradeState string
	Total      int64
}

func IsWeChatPayConfigured() bool {
	return strings.TrimSpace(setting.WeChatPayAppID) != "" &&
		strings.TrimSpace(setting.WeChatPayMchID) != "" &&
		strings.TrimSpace(setting.WeChatPaySerialNumber) != "" &&
		strings.TrimSpace(setting.WeChatPayPrivateKey) != "" &&
		strings.TrimSpace(setting.WeChatPayAPIV3Key) != "" &&
		strings.TrimSpace(setting.WeChatPayPlatformCertificate) != ""
}

func IsAlipayConfigured() bool {
	return strings.TrimSpace(setting.AlipayAppID) != "" &&
		strings.TrimSpace(setting.AlipayPrivateKey) != "" &&
		strings.TrimSpace(setting.AlipayPublicKey) != ""
}

func CreateWeChatNativeOrder(ctx context.Context, tradeNo string, description string, amount int64) (*WeChatNativeOrder, error) {
	if !IsWeChatPayConfigured() {
		return nil, errors.New("微信 Native 支付未配置完整")
	}
	privateKey, err := parseRSAPrivateKey(setting.WeChatPayPrivateKey)
	if err != nil {
		return nil, fmt.Errorf("微信商户私钥无效: %w", err)
	}
	notifyURL, err := configuredNotifyURL(setting.WeChatPayNotifyURL, "/api/wechatpay/notify")
	if err != nil {
		return nil, err
	}
	body, err := common.Marshal(map[string]any{
		"appid":        setting.WeChatPayAppID,
		"mchid":        setting.WeChatPayMchID,
		"description":  description,
		"out_trade_no": tradeNo,
		"notify_url":   notifyURL,
		"amount": map[string]any{
			"total":    amount,
			"currency": "CNY",
		},
	})
	if err != nil {
		return nil, err
	}

	path := "/v3/pay/transactions/native"
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	nonce := common.GetRandomString(32)
	signature, err := rsaSign(privateKey, strings.Join([]string{
		"POST",
		path,
		timestamp,
		nonce,
		string(body),
		"",
	}, "\n"))
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, wechatPayAPIBase+path, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf(
		`WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",signature="%s",timestamp="%s",serial_no="%s"`,
		setting.WeChatPayMchID,
		nonce,
		signature,
		timestamp,
		setting.WeChatPaySerialNumber,
	))

	responseBody, err := doDirectPaymentRequest(req)
	if err != nil {
		return nil, err
	}
	var response struct {
		CodeURL string `json:"code_url"`
		Code    string `json:"code"`
		Message string `json:"message"`
	}
	if err := common.Unmarshal(responseBody, &response); err != nil {
		return nil, err
	}
	if response.CodeURL == "" {
		if response.Message != "" {
			return nil, fmt.Errorf("微信下单失败: %s", response.Message)
		}
		return nil, fmt.Errorf("微信下单失败: %s", response.Code)
	}
	return &WeChatNativeOrder{CodeURL: response.CodeURL}, nil
}

func ParseWeChatPaymentNotification(body []byte, headers http.Header) (*WeChatPaymentNotification, error) {
	if !IsWeChatPayConfigured() {
		return nil, errors.New("微信 Native 支付未配置完整")
	}
	certificate, err := parseRSAPublicKey(setting.WeChatPayPlatformCertificate)
	if err != nil {
		return nil, fmt.Errorf("微信支付平台证书无效: %w", err)
	}
	timestamp := headers.Get("Wechatpay-Timestamp")
	nonce := headers.Get("Wechatpay-Nonce")
	signature := headers.Get("Wechatpay-Signature")
	serial := headers.Get("Wechatpay-Serial")
	if timestamp == "" || nonce == "" || signature == "" || serial == "" {
		return nil, errors.New("微信支付回调缺少验签头")
	}
	if serial != setting.WeChatPaySerialNumber {
		return nil, errors.New("wechat platform certificate serial number mismatch")
	}
	signatureBytes, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return nil, errors.New("微信支付回调签名格式无效")
	}
	digest := sha256.Sum256([]byte(timestamp + "\n" + nonce + "\n" + string(body) + "\n"))
	if err := rsa.VerifyPKCS1v15(certificate, crypto.SHA256, digest[:], signatureBytes); err != nil {
		return nil, errors.New("微信支付回调验签失败")
	}

	var notification struct {
		Resource struct {
			Algorithm      string `json:"algorithm"`
			Ciphertext     string `json:"ciphertext"`
			Nonce          string `json:"nonce"`
			AssociatedData string `json:"associated_data"`
		} `json:"resource"`
	}
	if err := common.Unmarshal(body, &notification); err != nil {
		return nil, err
	}
	if notification.Resource.Algorithm != "AEAD_AES_256_GCM" {
		return nil, errors.New("微信支付回调加密算法不受支持")
	}
	plaintext, err := decryptWechatResource(
		setting.WeChatPayAPIV3Key,
		notification.Resource.Nonce,
		notification.Resource.AssociatedData,
		notification.Resource.Ciphertext,
	)
	if err != nil {
		return nil, err
	}
	var transaction struct {
		AppID      string `json:"appid"`
		MchID      string `json:"mchid"`
		OutTradeNo string `json:"out_trade_no"`
		TradeState string `json:"trade_state"`
		Amount     struct {
			Total int64 `json:"total"`
		} `json:"amount"`
	}
	if err := common.Unmarshal(plaintext, &transaction); err != nil {
		return nil, err
	}
	return &WeChatPaymentNotification{
		AppID:      transaction.AppID,
		MchID:      transaction.MchID,
		OutTradeNo: transaction.OutTradeNo,
		TradeState: transaction.TradeState,
		Total:      transaction.Amount.Total,
	}, nil
}

func CreateAlipayPageOrder(tradeNo string, subject string, amount string) (string, map[string]string, error) {
	if !IsAlipayConfigured() {
		return "", nil, errors.New("支付宝电脑网站支付未配置完整")
	}
	privateKey, err := parseRSAPrivateKey(setting.AlipayPrivateKey)
	if err != nil {
		return "", nil, fmt.Errorf("支付宝应用私钥无效: %w", err)
	}
	notifyURL, err := configuredNotifyURL(setting.AlipayNotifyURL, "/api/alipay/notify")
	if err != nil {
		return "", nil, err
	}
	returnURL := strings.TrimSpace(setting.AlipayReturnURL)
	if returnURL == "" {
		base, baseErr := configuredNotifyURL("", "/wallet")
		if baseErr != nil {
			return "", nil, baseErr
		}
		returnURL = base
	}
	bizContent, err := common.Marshal(map[string]string{
		"out_trade_no": tradeNo,
		"product_code": "FAST_INSTANT_TRADE_PAY",
		"total_amount": amount,
		"subject":      subject,
	})
	if err != nil {
		return "", nil, err
	}
	params := map[string]string{
		"app_id":      setting.AlipayAppID,
		"method":      "alipay.trade.page.pay",
		"format":      "JSON",
		"charset":     "utf-8",
		"sign_type":   "RSA2",
		"timestamp":   time.Now().Format("2006-01-02 15:04:05"),
		"version":     "1.0",
		"notify_url":  notifyURL,
		"return_url":  returnURL,
		"biz_content": string(bizContent),
	}
	signature, err := rsaSign(privateKey, alipaySignContent(params))
	if err != nil {
		return "", nil, err
	}
	params["sign"] = signature
	return alipayGateway, params, nil
}

func VerifyAlipayNotification(values url.Values) error {
	if !IsAlipayConfigured() {
		return errors.New("支付宝电脑网站支付未配置完整")
	}
	signature := values.Get("sign")
	if signature == "" || values.Get("sign_type") != "RSA2" {
		return errors.New("支付宝回调签名参数无效")
	}
	publicKey, err := parseRSAPublicKey(setting.AlipayPublicKey)
	if err != nil {
		return fmt.Errorf("支付宝公钥无效: %w", err)
	}
	params := make(map[string]string, len(values))
	for key, list := range values {
		if key == "sign" || key == "sign_type" || len(list) == 0 {
			continue
		}
		params[key] = list[0]
	}
	signatureBytes, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return errors.New("支付宝回调签名格式无效")
	}
	digest := sha256.Sum256([]byte(alipaySignContent(params)))
	if err := rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, digest[:], signatureBytes); err != nil {
		return errors.New("支付宝回调验签失败")
	}
	return nil
}

func configuredNotifyURL(configured string, defaultPath string) (string, error) {
	if value := strings.TrimSpace(configured); value != "" {
		return strings.TrimRight(value, "/"), nil
	}
	base := strings.TrimRight(strings.TrimSpace(GetCallbackAddress()), "/")
	if base == "" {
		return "", errors.New("请先配置系统服务器地址或支付回调地址")
	}
	return base + defaultPath, nil
}

func doDirectPaymentRequest(req *http.Request) ([]byte, error) {
	client := &http.Client{Timeout: 15 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("支付平台返回 HTTP %d: %s", response.StatusCode, string(body))
	}
	return body, nil
}

func parseRSAPrivateKey(value string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(value)))
	if block == nil {
		return nil, errors.New("未找到 PEM 私钥")
	}
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("私钥不是 RSA 类型")
	}
	return rsaKey, nil
}

func parseRSAPublicKey(value string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(value)))
	if block == nil {
		return nil, errors.New("未找到 PEM 公钥或证书")
	}
	if block.Type == "CERTIFICATE" {
		certificate, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			return nil, err
		}
		publicKey, ok := certificate.PublicKey.(*rsa.PublicKey)
		if !ok {
			return nil, errors.New("证书公钥不是 RSA 类型")
		}
		return publicKey, nil
	}
	publicKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err == nil {
		rsaKey, ok := publicKey.(*rsa.PublicKey)
		if !ok {
			return nil, errors.New("公钥不是 RSA 类型")
		}
		return rsaKey, nil
	}
	rsaKey, err := x509.ParsePKCS1PublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return rsaKey, nil
}

func rsaSign(privateKey *rsa.PrivateKey, content string) (string, error) {
	digest := sha256.Sum256([]byte(content))
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, digest[:])
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(signature), nil
}

func decryptWechatResource(apiV3Key string, nonce string, associatedData string, ciphertext string) ([]byte, error) {
	key := []byte(apiV3Key)
	if len(key) != 32 {
		return nil, errors.New("微信 API v3 密钥必须是 32 字节")
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	ciphertextBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, err
	}
	plaintext, err := gcm.Open(nil, []byte(nonce), ciphertextBytes, []byte(associatedData))
	if err != nil {
		return nil, errors.New("微信支付回调解密失败")
	}
	return plaintext, nil
}

func alipaySignContent(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for key, value := range params {
		if key != "sign" && strings.TrimSpace(value) != "" {
			keys = append(keys, key)
		}
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, key+"="+params[key])
	}
	return strings.Join(parts, "&")
}

func EncodeAlipayForm(params map[string]string) string {
	values := url.Values{}
	for key, value := range params {
		values.Set(key, value)
	}
	return values.Encode()
}
