package controller

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

type directTopUpRequest struct {
	Amount int64 `json:"amount"`
}

func directTopUpAmount(amount int64, minTopUp int) (int64, error) {
	if amount < int64(minTopUp) {
		return 0, fmt.Errorf("topup amount must be at least %d", minTopUp)
	}
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		amount = decimal.NewFromInt(amount).Div(decimal.NewFromFloat(common.QuotaPerUnit)).IntPart()
	}
	if amount <= 0 {
		return 0, fmt.Errorf("topup amount is invalid")
	}
	return amount, nil
}

func directTradeNo(prefix string, userID int) string {
	return fmt.Sprintf("%s%d%d%s", prefix, userID, time.Now().UnixNano(), common.GetRandomString(6))
}

func RequestWeChatNativePay(c *gin.Context) {
	if !isWeChatNativeTopUpEnabled() {
		common.ApiErrorMsg(c, "WeChat Native payment is not configured")
		return
	}
	var req directTopUpRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiErrorMsg(c, "invalid payment amount")
		return
	}
	amount, err := directTopUpAmount(req.Amount, setting.WeChatPayMinTopUp)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	userID := c.GetInt("id")
	group, err := model.GetUserGroup(userID, true)
	if err != nil {
		common.ApiErrorMsg(c, "failed to load user group")
		return
	}
	payMoney := getPayMoney(req.Amount, group)
	if payMoney < 0.01 {
		common.ApiErrorMsg(c, "topup amount is too low")
		return
	}
	cents := decimal.NewFromFloat(payMoney).Mul(decimal.NewFromInt(100)).Round(0).IntPart()
	tradeNo := directTradeNo("WCN", userID)
	order, err := service.CreateWeChatNativeOrder(c.Request.Context(), tradeNo, "TokenFlow API recharge", cents)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("wechat native order creation failed user_id=%d trade_no=%s error=%q", userID, tradeNo, err.Error()))
		common.ApiErrorMsg(c, "failed to create WeChat payment order")
		return
	}
	topUp := &model.TopUp{
		UserId:          userID,
		Amount:          amount,
		Money:           payMoney,
		TradeNo:         tradeNo,
		PaymentMethod:   model.PaymentMethodWeChatNative,
		PaymentProvider: model.PaymentProviderWeChatNative,
		CreateTime:      common.GetTimestamp(),
		Status:          common.TopUpStatusPending,
	}
	if err := topUp.Insert(); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("wechat native topup insert failed user_id=%d trade_no=%s error=%q", userID, tradeNo, err.Error()))
		common.ApiErrorMsg(c, "failed to create payment order")
		return
	}
	common.ApiSuccess(c, gin.H{
		"trade_no": tradeNo,
		"code_url": order.CodeURL,
		"amount":   payMoney,
	})
}

func RequestAlipayPagePay(c *gin.Context) {
	if !isAlipayPageTopUpEnabled() {
		common.ApiErrorMsg(c, "Alipay page payment is not configured")
		return
	}
	var req directTopUpRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiErrorMsg(c, "invalid payment amount")
		return
	}
	amount, err := directTopUpAmount(req.Amount, setting.AlipayMinTopUp)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	userID := c.GetInt("id")
	group, err := model.GetUserGroup(userID, true)
	if err != nil {
		common.ApiErrorMsg(c, "failed to load user group")
		return
	}
	payMoney := getPayMoney(req.Amount, group)
	if payMoney < 0.01 {
		common.ApiErrorMsg(c, "topup amount is too low")
		return
	}
	tradeNo := directTradeNo("ALP", userID)
	urlString, params, err := service.CreateAlipayPageOrder(tradeNo, "TokenFlow API recharge", decimal.NewFromFloat(payMoney).Round(2).StringFixed(2))
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("alipay page order creation failed user_id=%d trade_no=%s error=%q", userID, tradeNo, err.Error()))
		common.ApiErrorMsg(c, "failed to create Alipay payment order")
		return
	}
	topUp := &model.TopUp{
		UserId:          userID,
		Amount:          amount,
		Money:           payMoney,
		TradeNo:         tradeNo,
		PaymentMethod:   model.PaymentMethodAlipayPage,
		PaymentProvider: model.PaymentProviderAlipayPage,
		CreateTime:      common.GetTimestamp(),
		Status:          common.TopUpStatusPending,
	}
	if err := topUp.Insert(); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("alipay page topup insert failed user_id=%d trade_no=%s error=%q", userID, tradeNo, err.Error()))
		common.ApiErrorMsg(c, "failed to create payment order")
		return
	}
	common.ApiSuccess(c, gin.H{
		"trade_no": tradeNo,
		"url":      urlString,
		"data":     params,
		"amount":   payMoney,
	})
}

func GetWeChatNativePayStatus(c *gin.Context) {
	tradeNo := strings.TrimSpace(c.Query("trade_no"))
	if tradeNo == "" {
		common.ApiErrorMsg(c, "trade number is required")
		return
	}
	topUp := model.GetTopUpByTradeNo(tradeNo)
	if topUp == nil || topUp.UserId != c.GetInt("id") || topUp.PaymentProvider != model.PaymentProviderWeChatNative {
		common.ApiErrorMsg(c, "payment order not found")
		return
	}
	common.ApiSuccess(c, gin.H{
		"trade_no": tradeNo,
		"status":   topUp.Status,
		"paid":     topUp.Status == common.TopUpStatusSuccess,
	})
}

func WeChatPayNotify(c *gin.Context) {
	if !isWeChatNativeTopUpEnabled() {
		writeWeChatNotifyFailure(c, "payment disabled")
		return
	}
	body, err := io.ReadAll(io.LimitReader(c.Request.Body, 2<<20))
	if err != nil {
		writeWeChatNotifyFailure(c, "invalid request")
		return
	}
	notification, err := service.ParseWeChatPaymentNotification(body, c.Request.Header)
	if err != nil || notification.AppID != setting.WeChatPayAppID || notification.MchID != setting.WeChatPayMchID || notification.TradeState != "SUCCESS" {
		writeWeChatNotifyFailure(c, "verification failed")
		return
	}
	topUp := model.GetTopUpByTradeNo(notification.OutTradeNo)
	if topUp == nil || topUp.PaymentProvider != model.PaymentProviderWeChatNative {
		writeWeChatNotifyFailure(c, "order not found")
		return
	}
	expectedCents := decimal.NewFromFloat(topUp.Money).Mul(decimal.NewFromInt(100)).Round(0).IntPart()
	if notification.Total != expectedCents {
		writeWeChatNotifyFailure(c, "amount mismatch")
		return
	}
	if err := model.CompleteDirectTopUp(notification.OutTradeNo, model.PaymentProviderWeChatNative, model.PaymentMethodWeChatNative, c.ClientIP()); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("wechat native callback settlement failed trade_no=%s error=%q", notification.OutTradeNo, err.Error()))
		writeWeChatNotifyFailure(c, "settlement failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": "SUCCESS", "message": "成功"})
}

func AlipayNotify(c *gin.Context) {
	if !isAlipayPageTopUpEnabled() || c.Request.ParseForm() != nil {
		c.String(http.StatusOK, "fail")
		return
	}
	values := c.Request.PostForm
	if err := service.VerifyAlipayNotification(values); err != nil || values.Get("app_id") != setting.AlipayAppID || values.Get("trade_status") != "TRADE_SUCCESS" {
		c.String(http.StatusOK, "fail")
		return
	}
	tradeNo := strings.TrimSpace(values.Get("out_trade_no"))
	topUp := model.GetTopUpByTradeNo(tradeNo)
	if topUp == nil || topUp.PaymentProvider != model.PaymentProviderAlipayPage {
		c.String(http.StatusOK, "fail")
		return
	}
	notifiedMoney, err := decimal.NewFromString(values.Get("total_amount"))
	expectedMoney := decimal.NewFromFloat(topUp.Money).Round(2)
	if err != nil || !notifiedMoney.Equal(expectedMoney) {
		c.String(http.StatusOK, "fail")
		return
	}
	if err := model.CompleteDirectTopUp(tradeNo, model.PaymentProviderAlipayPage, model.PaymentMethodAlipayPage, c.ClientIP()); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("alipay callback settlement failed trade_no=%s error=%q", tradeNo, err.Error()))
		c.String(http.StatusOK, "fail")
		return
	}
	c.String(http.StatusOK, "success")
}

func writeWeChatNotifyFailure(c *gin.Context, message string) {
	c.JSON(http.StatusOK, gin.H{"code": "FAIL", "message": message})
}
