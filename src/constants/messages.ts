export const COMMON_MESSAGES = {
  PAGE_MUST_BE_A_INTEGER_AND_POSITIVE: 'Page phải là một số nguyên dương khác 0',
  LIMIT_MUST_BE_A_INTEGER_AND_POSITIVE: 'Limit phải là một số nguyên dương'
} as const

export const ACCOUNT_MESSAGES = {
  VALIDATION_ERROR: 'Lỗi xác thực',
  REGISTER_SUCCEED: 'Đăng ký tài khoản thành công',
  EMAIL_IS_REQUIRED: 'Email là bắt buộc',
  EMAIL_IS_INVALID: 'Email không hợp lệ',
  EMAIL_ALREADY_EXIST: 'Email đã tồn tại',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc',
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
  UPLOAD_IMAGE_SUCCEED: 'Tải lên hình ảnh thành công',
  UPLOAD_VIDEO_HLS_SUCCEED: 'Tải lên video HLS thành công',
  GET_VIDEO_STATUS_SUCCEED: 'Lấy trạng thái video thành công'
} as const

export const SUBSCRIPTION_MESSAGES = {
  SUBSCRIBE_SUCCEED: 'Đăng ký kênh thành công',
  ALREADY_SUBSCRIBE: 'Đã đăng ký kênh trước đó',
  UNSUBSCRIBE_SUCCEED: 'Hủy đăng ký kênh thành công',
  NOT_SUBSCRIBED: 'Chưa đăng ký kênh này',
  GET_CHANNELS_SUBSCRIBED_OF_ME_SUCCEED: 'Lấy danh sách kênh đã đăng ký thành công'
} as const

export const VIDEO_MESSAGES = {
  CREATE_VIDEO_CATEGORY_SUCCEED: 'Tạo danh mục video thành công',
  CATEGORY_NAME_IS_REQUIRED: 'Tên danh mục video là bắt buộc',
  CATEGORY_NAME_LENGTH_IS_INVALID: 'Tên danh mục video phải dài từ 6 đến 50 ký tự',
  CATEGORY_DESCRIPTION_LENGTH_IS_INVALID: 'Mô tả danh mục video phải dài từ 6 đến 255 ký tự',
  UPDATE_VIDEO_CATEGORY_SUCCEED: 'Cập nhật danh mục video thành công',
  VIDEO_CATEGORY_ID_IS_REQUIRED: 'Id danh mục video là bắt buộc',
  VIDEO_CATEGORY_ID_INVALID: 'Id danh mục video không hợp lệ',
  VIDEO_CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục video',
  VIDEO_CATEGORY_AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của danh mục video này',
  DELETE_VIDEO_CATEGORY_SUCCEED: 'Xóa danh mục video thành công',
  CREATE_VIDEO_SUCCEED: 'Tạo video thành công',
  ID_NAME_IS_REQUIRED: 'Id name video là bắt buộc',
  THUMBNAIL_IS_REQUIRED: 'Hình thu nhỏ là bắt buộc',
  THUMBNAIL_IS_INVALID: 'Hình thu nhỏ không hợp lệ',
  TITLE_IS_REQUIRED: 'Tiêu đề là bắt buộc',
  TITLE_LENGTH_IS_INVALID: 'Tiêu đề phải dài từ 6 đến 500 ký tự',
  CATEGORY_IS_REQUIRED: 'Danh mục video là bắt buộc',
  CATEGORY_IS_INVALID: 'Danh mục video không hợp lệ',
  CATEGORY_NOT_FOUND: 'Không tim thấy danh mục video',
  AUDIENCE_IS_INVALID: 'Tùy chọn người xem không hợp lệ',
  UPDATE_VIDEO_SUCCEED: 'Cập nhật video thành công',
  VIDEO_ID_IS_REQUIRED: 'Video id là bắt buộc',
  VIDEO_ID_INVALID: 'Video id không hợp lệ',
  VIDEO_NOT_FOUND: 'Không tìm thấy video',
  VIDEO_AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của video này',
  VIDEO_IDS_IS_REQUIRED: 'Video ids là bắt buộc',
  VIDEO_IDS_MUST_BE_AN_ARRAY: 'Video ids phải là một mảng',
  VIDEO_IDS_HAVE_NOT_EMPTY: 'Video ids không được để trống',
  VIDEO_IDS_IS_INVALID: 'Video ids không hợp lệ',
  GET_PUBLIC_VIDEOS_SUCCEED: 'Lấy danh sách video công khai thành công',
  GET_VIDEOS_OF_ME_SUCCEED: 'Lấy danh sách video của tôi thành công',
  GET_VIDEO_DETAIL_SUCCEED: 'Lấy thông tin chi tiết video thành công'
} as const

export const REACTION_MESSAGES = {
  CREATE_REACTION_SUCCEED: 'Thêm reaction thành công',
  REACTION_TYPE_IS_REQUIRED: 'Reaction type là bắt buộc',
  REACTION_TYPE_IS_INVALID: 'Reaction type không hợp lệ',
  REACTION_BEFORE: 'Đã reaction nội dung này trước đó',
  REACTION_ID_IS_REQUIRED: 'Reaction id là bắt buộc',
  REACTION_ID_IS_INVALID: 'Reaction id không hợp lệ',
  REACTION_NOT_FOUND: 'Không tìm thấy lượt reaction trùng khớp với reaction id',
  REACTION_AUTHOR_IS_INVALID: 'Bạn không phải người reaction nội dung này',
  HAVE_REACTION_BEFORE: 'Bạn đã reaction nội dung này trước đó',
  UPDATE_REACTION_SUCCEED: 'Cập nhật reaction thành công',
  DELETE_REACTION_SUCCEED: 'Xóa reaction thành công',
  CONTENT_ID_IS_REQUIRED: 'Content id là bắt buộc',
  CONTENT_ID_IS_INVALID: 'Content id không hợp lệ',
  CONTENT_ID_NOT_FOUND: 'Không tìm thấy content id',
  CONTENT_TYPE_IS_REQUIRED: 'Content type là bắt buộc',
  CONTENT_TYPE_IS_INVALID: 'Content type không hợp lệ'
} as const

export const BOOKMARK_MESSAGES = {
  CREATE_BOOKMARK_SUCCEED: 'Tạo bookmark thành công',
  BOOKMARK_ID_IS_REQUIRED: 'Bookmark id là bắt buộc',
  BOOKMARK_ID_IS_INVALID: 'Bookmark id không hợp lệ',
  BOOKMARK_NOT_FOUND: 'Không tìm thấy bookmark',
  BOOKMARK_AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của bookmark này',
  DELETE_BOOKMARK_SUCCEED: 'Xóa bookmark thành công',
  ALREADY_BOOKMARK_THIS_VIDEO: 'Đã bookmark video này trước đó'
} as const

export const WATCH_HISTORY_MESSAGES = {
  CREATE_WATCH_HISTORY_SUCCEED: 'Tạo lịch sử xem thành công',
  GET_WATCH_HISTORIES_SUCCEED: 'Lấy lịch sử xem thành công'
} as const

export const COMMENT_MESSAGES = {
  CREATE_COMMENT_SUCCEED: 'Thêm bình luận thành công',
  COMMENT_CONTENT_IS_REQUIRED: 'Nội dung bình luận là bắt buộc',
  COMMENT_TYPE_IS_REQUIRED: 'Loại bình luận là bắt buộc',
  COMMENT_TYPE_IS_INVALID: 'Loại bình luận không hợp lệ',
  COMMENT_CONTENT_ID_IS_REQUIRED: 'Content id là bắt buộc',
  COMMENT_CONTENT_ID_IS_INVALID: 'Content id không hợp lệ',
  COMMENT_CONTENT_ID_NOT_FOUND: 'Không tìm thấy nội dung khớp với content id',
  COMMENT_ID_IS_REQUIRED: 'Comment id là bắt buộc',
  COMMENT_ID_IS_INVALID: 'Comment id không hợp lệ',
  COMMENT_NOT_FOUND: 'Không tìm thấy bình luận',
  COMMENT_AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của bình luận này',
  UPDATE_COMMENT_SUCCEED: 'Cập nhật bình luận thành công',
  DELETE_COMMENT_SUCCEED: 'Xóa bình luận thành công',
  REPLY_COMMENT_SUCCEED: 'Trả lời bình luận thành công',
  GET_COMMENTS_SUCCEED: 'Lấy danh sách bình luận thành công',
  GET_REPLIES_OF_COMMENT_SUCCEED: 'Lấy danh sách trả lời bình luận thành công'
} as const

export const REPORT_MESSAGES = {
  SEND_REPORT_SUCCEED: 'Gửi báo cáo thành công',
  CONTENT_IS_REQUIRED: 'Nội dung báo cáo là bắt buộc',
  CONTENT_ID_IS_REQUIRED: 'Content id là bắt buộc',
  CONTENT_ID_IS_INVALID: 'Content id không hợp lệ',
  CONTENT_ID_IS_NOT_FOUND: 'Không tìm thấy nội dung trùng với content id',
  CONTENT_TYPE_IS_REQUIRED: 'Content type là bắt buộc',
  CONTENT_TYPE_IS_INVALID: 'Content type không hợp lệ',
  UPDATE_REPORT_SUCCEED: 'Cập nhật trạng thái báo cáo thành công',
  REPORT_ID_IS_REQUIRED: 'Report id là bắt buộc',
  REPORT_ID_IS_INVALID: 'Report id không hợp lệ',
  REPORT_NOT_FOUND: 'Không tìm thấy báo cáo',
  STATUS_IS_REQUIRED: 'Report status là bắt buộc',
  STATUS_IS_INVALID: 'Report status không hợp lệ',
  REPORT_IDS_IS_REQUIRED: 'Report ids là bắt buộc',
  REPORT_IDS_MUST_BE_AN_ARRAY: 'Report ids phải là một mảng',
  REPORT_IDS_CANNOT_BE_EMPTY: 'Report ids không được rỗng',
  REPORT_IDS_IS_INVALID: 'Report ids không hợp lệ',
  GET_REPORTS_SUCCEED: 'Lấy danh sách báo cáo thành công'
} as const

export const POST_MESSAGES = {
  CREATE_POST_SUCCEED: 'Tạo bài viết thành công',
  IMAGES_MUST_BE_AN_ARRAY: 'Images phải là một mảng',
  IMAGES_CANNOT_BE_EMPTY: 'Images không được rỗng',
  IMAGES_IS_INVALID: 'Images không hợp lệ',
  CONTENT_IS_REQUIRED: 'Nội dung bài viết là bắt buộc',
  AUDIENCE_IS_INVALID: 'Post audience không hợp lệ',
  POST_ID_IS_REQUIRED: 'Post id là bắt buộc',
  POST_ID_IS_INVALID: 'Post id không hợp lệ',
  POST_NOT_FOUND: 'Không tìm thấy bài viết',
  AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của bài viết',
  UPDATE_POST_SUCCEED: 'Cập nhật bài viết thành công',
  POST_IDS_IS_REQUIRED: 'Post ids không hợp lệ',
  POST_IDS_MUST_BE_AN_ARRAY: 'Post ids phải là một mảng',
  POST_IDS_CANNOT_BE_EMPTY: 'Post ids không được rỗng',
  POST_IDS_IS_INVALID: 'Post ids không hợp lệ',
  POST_IDS_AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của một trong số các bài viết',
  GET_POSTS_IN_PROFILE_PAGE_SUCCEED: 'Lấy danh sách bài viết của trang cá nhân thành công',
  GET_POST_DETAIL_SUCCEED: 'Lấy chi tiết bài viết thành công'
} as const

export const PLAYLIST_MESSAGES = {
  CREATE_PLAYLIST_SUCCEED: 'Tạo playlist thành công',
  NAME_IS_REQUIRED: 'Tên playlist là bắt buộc',
  AUDIENCE_IS_INVALID: 'Playlist audience không hợp lệ',
  NAME_LENGTH_IS_INVALID: 'Tên playlist phải dài từ 6 đến 255 ký tự',
  UPDATE_PLAYLIST_SUCCEED: 'Cập nhật playlist thành công',
  PLAYLIST_ID_IS_REQUIRED: 'Playlist id is required',
  PLAYLIST_ID_IS_INVALID: 'Playlist id không hợp lệ',
  PLAYLIST_NOT_FOUND: 'Không tìm thấy playlist',
  PLAYLIST_AUTHOR_IS_INVALID: 'Bạn không phải là tác giả của playlist',
  DELETE_PLAYLIST_SUCCEED: 'Xóa playlist thành công',
  ADD_VIDEO_TO_PLAYLIST_SUCCEED: 'Thêm video vào playlist thành công',
  VIDEO_ALREADY_IN_PLAYLIST: 'Video đã được thêm vào playlist trước đó',
  REMOVE_VIDEO_FROM_PLAYLIST_SUCCEED: 'Xóa video khỏi playlist thành công',
  VIDEO_NOT_ALREADY_IN_PLAYLIST: 'Video chưa được thêm vào playlist',
  GET_VIDEOS_FROM_PLAYLIST_SUCCEED: 'Lấy danh sách video từ playlist thành công',
  GET_PLAYLISTS_SUCCEED: 'Lấy danh sách playlist thành công'
} as const

export const SEARCH_MESSAGES = {
  SEARCH_SUCCEED: 'Tìm kiếm thành công',
  SEARCH_QUERY_IS_REQUIRED: 'Search query là bắt buộc'
} as const
