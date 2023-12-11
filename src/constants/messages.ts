export const ACCOUNT_MESSAGES = {
  VALIDATION_ERROR: 'Lỗi xác thực',
  REGISTER_SUCCEED: 'Đăng ký tài khoản thành công',
  EMAIL_IS_REQUIRED: 'Email là bắc buộc',
  EMAIL_IS_INVALID: 'Email không hợp lệ',
  EMAIL_ALREADY_EXIST: 'Email đã tồn tại',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắc buộc',
  PASSWORD_LENGTH_IS_INVALID: 'Mật khẩu phải dài từ 6 đến 32 ký tự',
  CONFIRM_PASSWORD_NOT_MATCH: 'Xác nhận mật khẩu không chính xác',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Xác nhận mật khẩu là bắt buộc',
  EMAIL_OR_PASSWORD_IS_INVALID: 'Email hoặc mật khẩu không chính xác',
  LOGIN_SUCCEED: 'Đăng nhập thành công',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắt buộc',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXISTED: 'Refresh token không tồn tại hoặc đã được sử dụng',
  LOGOUT_SUCCEED: 'Đăng xuất thành công',
  REFRESH_TOKEN_SUCCEED: 'Refresh token thành công',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc',
  ACCOUNT_BY_TOKEN_NOT_FOUND: 'Không tìm thấy tài khoản chứa token này',
  VERIFY_EMAIL_TOKEN_IS_REQUIRED: 'Verify email token là bắt buộc',
  VERIFY_EMAIL_SUCCEED: 'Xác thực email thành công',
  RESEND_EMAIL_VERIFY_ACCOUNT_SUCCEED: 'Gửi lại email xác thực tài khoản thành công',
  ACCOUNT_VERIFIED_BEFORE: 'Tài khoản đã được xác thực trước đó',
  EMAIL_NOT_EXISTED: 'Email không tồn tại',
  FORGOT_PASSWORD_SUCCEED: 'Yêu cầu quên mật khẩu được chấp nhận, vui lòng kiểm tra email để đặt lại mật khẩu',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token là bắt buộc',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCEED: 'Xác thực forgot password token thành công'
} as const
