package setting

// Direct payment credentials for official WeChat Pay Native and Alipay page
// payment integrations. These values are intentionally kept in the option
// store so administrators can rotate them without rebuilding the service.
var (
	WeChatPayAppID               string
	WeChatPayMchID               string
	WeChatPaySerialNumber        string
	WeChatPayPrivateKey          string
	WeChatPayAPIV3Key            string
	WeChatPayPlatformCertificate string
	WeChatPayNotifyURL           string
	WeChatPayMinTopUp            int = 1
	AlipayAppID                  string
	AlipayPrivateKey             string
	AlipayPublicKey              string
	AlipayNotifyURL              string
	AlipayReturnURL              string
	AlipayMinTopUp               int = 1
)
