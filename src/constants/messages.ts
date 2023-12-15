export const COMMON_MESSAGES = {
  PAGE_MUST_BE_A_INTEGER_AND_POSITIVE: 'Page phải là một số nguyên dương khác 0',
  LIMIT_MUST_BE_A_INTEGER_AND_POSITIVE: 'Limit phải là một số nguyên dương'
}

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
  FORGOT_PASSWORD_SUCCEED:
    'Yêu cầu quên mật khẩu được chấp nhận, vui lòng kiểm tra email để đặt lại mật khẩu, email có hiệu lực trong vòng 5 phút',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token là bắt buộc',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCEED: 'Xác thực forgot password token thành công',
  ACCOUNT_ID_IS_REQUIRED: 'Account id là bắt buộc',
  ACCOUNT_ID_IS_INVALID: 'Account id không hợp lệ',
  ACCOUNT_NOT_FOUND: 'Không tìm thấy account',
  RESET_PASSWORD_SUCCEED: 'Đặt lại mật khẩu thành công',
  CHANGE_PASSWORD_SUCCEED: 'Thay đổi mật khẩu thành công',
  OLD_PASSWORD_IS_INCORRECT: 'Mật khẩu cũ không chính xác',
  OLD_PASSWORD_IS_REQUIRED: 'Mật khẩu cũ là bắt buộc',
  GET_ME_SUCCEED: 'Lấy thông tin tài khoản đăng nhập thành công',
  UPDATE_ME_SUCCEED: 'Cập nhật thông tin tài khoản thành công',
  USERNAME_LENGTH_IS_INVALID: 'Username phải có độ dài từ 6 đến 32 ký tự',
  USERNAME_ALREADY_EXIST: 'Username đã tồn tại',
  CHANNEL_NAME_LENGTH_IS_INVALID: 'Tên channel phải có độ dài từ 6 đến 32 ký tự',
  CHANNEL_NAME_ALREADY_EXIST: 'Tên channel đã tồn tại',
  BIO_LENGTH_IS_INVALID: 'Bio phải dài từ 6 đến 255 ký tự',
  AVATAR_IS_INVALID: 'Ảnh đại diện không hợp lệ',
  COVER_IS_INVALID: 'Ảnh bìa không hợp lệ',
  ACCOUNT_IS_UNVERIFIED: 'Tài khoản chưa được xác thực',
  GET_PROFILE_PAGE_SUCCEED: 'Lấy thông tin trang cá nhân thành công',
  USERNAME_IS_REQUIRED: 'Username là bắt buộc',
  USERNAME_MUST_WITHOUT_SPACES: 'Username phải viết liền không được chứa khoảng trắng',
  PERMISSION_DENIED: 'Không được phép truy cập tài nguyên',
  GET_ALL_ACCOUNTS_SUCCEED: 'Lấy toàn bộ thông tin tài khoản thành công',
  UPDATE_ACCOUNT_SUCCEED: 'Cập nhật tài khoản thành công',
  TICK_MUST_BE_A_BOOLEAN: 'Tick phải là true hoặc false',
  ROLE_IS_INVALID: 'Role không hợp lệ',
  STATUS_IS_INVALID: 'Status không hợp lệ',
  ACCOUNT_IDS_IS_REQUIRED: 'Account ids là bắt buộc',
  ACCOUNT_IDS_MUST_BE_AN_ARRAY: 'Account ids phải là một mảng',
  ACCOUNT_IDS_CAN_NOT_BE_EMPTY: 'Account ids không được rỗng'
} as const

export const MEDIA_MESSAGES = {
  FILE_TYPE_INVALID: 'Loại file không hợp lệ',
  IMAGE_FIELD_IS_REQUIRED: 'Field image là bắt buộc',
  UPLOAD_IMAGE_SUCCEED: 'Tải lên hình ảnh thành công'
} as const

export const SUBSCRIPTION_MESSAGES = {
  SUBSCRIBE_SUCCEED: 'Đăng ký kênh thành công',
  ALREADY_SUBSCRIBE: 'Đã đăng ký kênh trước đó'
} as const
