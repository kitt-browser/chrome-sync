/**
 * Using Protobufjs (https://github.com/dcodeIO/ProtoBuf.js)
 * It's internal tool Protobuf.js/bin/pbjs -t proto ./protocol/sync.proto > ./sync.proto.js
 */

module.exports = `
package sync_pb;

option optimize_for = "LITE_RUNTIME";

message AppListSpecifics {
    optional string item_id = 1;
    optional AppListItemType item_type = 2;
    optional string item_name = 3;
    optional string parent_id = 4;
    optional string OBSOLETE_page_ordinal = 5 [deprecated = true];
    optional string item_ordinal = 6;

    enum AppListItemType {
        TYPE_APP = 1;
        TYPE_REMOVE_DEFAULT_APP = 2;
        TYPE_FOLDER = 3;
        TYPE_URL = 4;
    }
}

message AppNotification {
    optional string guid = 1;
    optional string app_id = 2;
    optional int64 creation_timestamp_ms = 3;
    optional string title = 4;
    optional string body_text = 5;
    optional string link_url = 6;
    optional string link_text = 7;
}

message ExtensionSettingSpecifics {
    optional string extension_id = 1;
    optional string key = 2;
    optional string value = 3;
}

message AppSettingSpecifics {
    optional ExtensionSettingSpecifics extension_setting = 1;
}

message ExtensionSpecifics {
    optional string id = 1;
    optional string version = 2;
    optional string update_url = 3;
    optional bool enabled = 4;
    optional bool incognito_enabled = 5;
    optional string name = 6;
    optional bool remote_install = 7;
    optional bool installed_by_custodian = 8;
    optional bool all_urls_enabled = 9;
    optional int32 disable_reasons = 10;
}

message AppNotificationSettings {
    optional bool initial_setup_done = 1;
    optional bool disabled = 2;
    optional string oauth_client_id = 3;
}

message LinkedAppIconInfo {
    optional string url = 1;
    optional uint32 size = 2;
}

message AppSpecifics {
    optional ExtensionSpecifics extension = 1;
    optional AppNotificationSettings notification_settings = 2;
    optional string app_launch_ordinal = 3;
    optional string page_ordinal = 4;
    optional LaunchType launch_type = 5;
    optional string bookmark_app_url = 6;
    optional string bookmark_app_description = 7;
    optional string bookmark_app_icon_color = 8;
    optional LinkedAppIconInfo linked_app_icons = 9;

    enum LaunchType {
        PINNED = 0;
        REGULAR = 1;
        FULLSCREEN = 2;
        WINDOW = 3;
    }
}

message AttachmentIdProto {
    optional string unique_id = 1;
    optional uint64 size_bytes = 2;
    optional uint32 crc32c = 3;
}

message AttachmentMetadataRecord {
    optional AttachmentIdProto id = 1;
    optional bool is_on_server = 2;
}

message AttachmentMetadata {
    optional AttachmentMetadataRecord record = 1;
}

message ArticleSpecifics {
    optional string entry_id = 1;
    optional string title = 2;
    optional ArticlePage pages = 3;
    optional ArticleAttachments attachments = 4;
}

message ArticlePage {
    optional string url = 1;
}

message ArticleAttachments {
    optional AttachmentIdProto distilled_article = 1;
}

message AutofillProfileSpecifics {
    optional string guid = 15;
    optional string origin = 16;
    optional int64 use_count = 22;
    optional int64 use_date = 23;
    optional string name_first = 2;
    optional string name_middle = 3;
    optional string name_last = 4;
    optional string name_full = 21;
    optional string email_address = 5;
    optional string company_name = 6;
    optional string address_home_line1 = 7;
    optional string address_home_line2 = 8;
    optional string address_home_city = 9;
    optional string address_home_state = 10;
    optional string address_home_zip = 11;
    optional string address_home_country = 12;
    optional string address_home_street_address = 17;
    optional string address_home_sorting_code = 18;
    optional string address_home_dependent_locality = 19;
    optional string address_home_language_code = 20;
    optional string phone_home_whole_number = 13;
    optional string label = 1 [deprecated = true];
    optional string phone_fax_whole_number = 14 [deprecated = true];
}

message AutofillSpecifics {
    optional string name = 1;
    optional string value = 2;
    optional int64 usage_timestamp = 3;
    optional AutofillProfileSpecifics profile = 4;
}

message WalletMaskedCreditCard {
    optional string id = 1;
    optional WalletCardStatus status = 2;
    optional string name_on_card = 3;
    optional WalletCardType type = 4;
    optional string last_four = 5;
    optional int32 exp_month = 6;
    optional int32 exp_year = 7;

    enum WalletCardStatus {
        VALID = 0;
        EXPIRED = 1;
    }

    enum WalletCardType {
        UNKNOWN = 0;
        AMEX = 1;
        DISCOVER = 2;
        JCB = 3;
        MAESTRO = 4;
        MASTER_CARD = 5;
        SOLO = 6;
        SWITCH = 7;
        VISA = 8;
    }
}

message WalletPostalAddress {
    optional string id = 1;
    optional string recipient_name = 12;
    optional string company_name = 2;
    optional string street_address = 3;
    optional string address_1 = 4;
    optional string address_2 = 5;
    optional string address_3 = 6;
    optional string address_4 = 7;
    optional string postal_code = 8;
    optional string sorting_code = 9;
    optional string country_code = 10;
    optional string language_code = 11;
    optional string phone_number = 13;
}

message AutofillWalletSpecifics {
    optional WalletInfoType type = 1;
    optional WalletMaskedCreditCard masked_card = 2;
    optional WalletPostalAddress address = 3;

    enum WalletInfoType {
        UNKNOWN = 0;
        MASKED_CREDIT_CARD = 1;
        POSTAL_ADDRESS = 2;
    }
}

message WalletMetadataSpecifics {
    optional Type type = 1;
    optional string id = 2;
    optional int64 use_count = 3;
    optional int64 use_date = 4;

    enum Type {
        UNKNOWN = 0;
        CARD = 1;
        ADDRESS = 2;
    }
}

message MetaInfo {
    optional string key = 1;
    optional string value = 2;
}

message BookmarkSpecifics {
    optional string url = 1;
    optional bytes favicon = 2;
    optional string title = 3;
    optional int64 creation_time_us = 4;
    optional string icon_url = 5;
    optional MetaInfo meta_info = 6;
}

message CustomNudgeDelay {
    optional int32 datatype_id = 1;
    optional int32 delay_ms = 2;
}

message ClientCommand {
    optional int32 set_sync_poll_interval = 1;
    optional int32 set_sync_long_poll_interval = 2;
    optional int32 max_commit_batch_size = 3;
    optional int32 sessions_commit_delay_seconds = 4;
    optional int32 throttle_delay_seconds = 5;
    optional int32 client_invalidation_hint_buffer_size = 6;
    optional int32 gu_retry_delay_seconds = 7;
    optional CustomNudgeDelay custom_nudge_delays = 8;
}

message GetUpdatesCallerInfo {
    required GetUpdatesSource source = 1;
    optional bool notifications_enabled = 2;

    enum GetUpdatesSource {
        UNKNOWN = 0;
        FIRST_UPDATE = 1;
        LOCAL = 2;
        NOTIFICATION = 3;
        PERIODIC = 4;
        SYNC_CYCLE_CONTINUATION = 5;
        NEWLY_SUPPORTED_DATATYPE = 7;
        MIGRATION = 8;
        NEW_CLIENT = 9;
        RECONFIGURATION = 10;
        DATATYPE_REFRESH = 11;
        RETRY = 13;
        PROGRAMMATIC = 14;
    }
}

message SyncEnums {
    enum SingletonDebugEventType {
        CONNECTION_STATUS_CHANGE = 1;
        UPDATED_TOKEN = 2;
        PASSPHRASE_REQUIRED = 3;
        PASSPHRASE_ACCEPTED = 4;
        INITIALIZATION_COMPLETE = 5;
        STOP_SYNCING_PERMANENTLY = 6;
        ENCRYPTION_COMPLETE = 7;
        ACTIONABLE_ERROR = 8;
        ENCRYPTED_TYPES_CHANGED = 9;
        PASSPHRASE_TYPE_CHANGED = 10;
        KEYSTORE_TOKEN_UPDATED = 11;
        CONFIGURE_COMPLETE = 12;
        BOOTSTRAP_TOKEN_UPDATED = 13;
    }

    enum PageTransition {
        LINK = 0;
        TYPED = 1;
        AUTO_BOOKMARK = 2;
        AUTO_SUBFRAME = 3;
        MANUAL_SUBFRAME = 4;
        GENERATED = 5;
        AUTO_TOPLEVEL = 6;
        FORM_SUBMIT = 7;
        RELOAD = 8;
        KEYWORD = 9;
        KEYWORD_GENERATED = 10;
    }

    enum PageTransitionRedirectType {
        CLIENT_REDIRECT = 1;
        SERVER_REDIRECT = 2;
    }

    enum ErrorType {
        SUCCESS = 0;
        ACCESS_DENIED = 1;
        NOT_MY_BIRTHDAY = 2;
        THROTTLED = 3;
        AUTH_EXPIRED = 4;
        USER_NOT_ACTIVATED = 5;
        AUTH_INVALID = 6;
        CLEAR_PENDING = 7;
        TRANSIENT_ERROR = 8;
        MIGRATION_DONE = 9;
        DISABLED_BY_ADMIN = 10;
        USER_ROLLBACK = 11;
        PARTIAL_FAILURE = 12;
        UNKNOWN = 100;
    }

    enum Action {
        UPGRADE_CLIENT = 0;
        CLEAR_USER_DATA_AND_RESYNC = 1;
        ENABLE_SYNC_ON_ACCOUNT = 2;
        STOP_AND_RESTART_SYNC = 3;
        DISABLE_SYNC_ON_CLIENT = 4;
        UNKNOWN_ACTION = 5;
    }

    enum DeviceType {
        TYPE_WIN = 1;
        TYPE_MAC = 2;
        TYPE_LINUX = 3;
        TYPE_CROS = 4;
        TYPE_OTHER = 5;
        TYPE_PHONE = 6;
        TYPE_TABLET = 7;
    }

    enum GetUpdatesOrigin {
        UNKNOWN_ORIGIN = 0;
        PERIODIC = 4;
        NEWLY_SUPPORTED_DATATYPE = 7;
        MIGRATION = 8;
        NEW_CLIENT = 9;
        RECONFIGURATION = 10;
        GU_TRIGGER = 12;
        RETRY = 13;
        PROGRAMMATIC = 14;
    }
}

message TypeHint {
    optional int32 data_type_id = 1;
    optional bool has_valid_hint = 2;
}

message SourceInfo {
    optional GetUpdatesCallerInfo.GetUpdatesSource source = 1;
    optional TypeHint type_hint = 2;
}

message SyncCycleCompletedEventInfo {
    optional int32 num_blocking_conflicts = 2 [deprecated = true];
    optional int32 num_non_blocking_conflicts = 3 [deprecated = true];
    optional int32 num_encryption_conflicts = 4;
    optional int32 num_hierarchy_conflicts = 5;
    optional int32 num_simple_conflicts = 6;
    optional int32 num_server_conflicts = 7;
    optional int32 num_updates_downloaded = 8;
    optional int32 num_reflected_updates_downloaded = 9;
    optional GetUpdatesCallerInfo caller_info = 10;
    optional SourceInfo source_info = 11;
}

message DatatypeAssociationStats {
    optional int32 data_type_id = 1;
    optional int32 num_local_items_before_association = 2;
    optional int32 num_sync_items_before_association = 3;
    optional int32 num_local_items_after_association = 4;
    optional int32 num_sync_items_after_association = 5;
    optional int32 num_local_items_added = 6;
    optional int32 num_local_items_deleted = 7;
    optional int32 num_local_items_modified = 8;
    optional int32 num_sync_items_added = 9;
    optional int32 num_sync_items_deleted = 10;
    optional int32 num_sync_items_modified = 11;
    optional int64 local_version_pre_association = 20;
    optional int64 sync_version_pre_association = 21;
    optional bool had_error = 12;
    optional int64 download_wait_time_us = 15;
    optional int64 download_time_us = 13;
    optional int64 association_wait_time_for_high_priority_us = 16;
    optional int64 association_wait_time_for_same_priority_us = 14;
    optional int64 association_time_us = 17;
    optional int32 high_priority_type_configured_before = 18;
    optional int32 same_priority_type_configured_before = 19;
}

message DebugEventInfo {
    optional SyncEnums.SingletonDebugEventType singleton_event = 1;
    optional SyncCycleCompletedEventInfo sync_cycle_completed_event_info = 2;
    optional int32 nudging_datatype = 3;
    optional int32 datatypes_notified_from_server = 4;
    optional DatatypeAssociationStats datatype_association_stats = 5;
}

message DebugInfo {
    optional DebugEventInfo events = 1;
    optional bool cryptographer_ready = 2;
    optional bool cryptographer_has_pending_keys = 3;
    optional bool events_dropped = 4;
}

message DeviceInfoSpecifics {
    optional string cache_guid = 1;
    optional string client_name = 2;
    optional SyncEnums.DeviceType device_type = 3;
    optional string sync_user_agent = 4;
    optional string chrome_version = 5;
    optional int64 backup_timestamp = 6;
    optional string signin_scoped_device_id = 7;
}

message DictionarySpecifics {
    optional string word = 1;
}

message EncryptedData {
    optional string key_name = 1;
    optional string blob = 2;
}

message KeystoreEncryptionFlags {
    optional bool enabled = 1;
}

message HistoryDeleteDirectives {
    optional bool enabled = 1;
}

message AutofillCullingFlags {
    optional bool enabled = 1;
}

message FaviconSyncFlags {
    optional bool enabled = 1;
    optional int32 favicon_sync_limit = 2 [default = 200];
}

message PreCommitUpdateAvoidanceFlags {
    optional bool enabled = 1;
}

message GcmChannelFlags {
    optional bool enabled = 1;
}

message EnhancedBookmarksFlags {
    optional bool enabled = 1;
    optional string extension_id = 2;
}

message GcmInvalidationsFlags {
    optional bool enabled = 1;
}

message WalletSyncFlags {
    optional bool enabled = 1;
}

message ExperimentsSpecifics {
    optional KeystoreEncryptionFlags keystore_encryption = 1;
    optional HistoryDeleteDirectives history_delete_directives = 2;
    optional AutofillCullingFlags autofill_culling = 3;
    optional FaviconSyncFlags favicon_sync = 4;
    optional PreCommitUpdateAvoidanceFlags pre_commit_update_avoidance = 5;
    optional GcmChannelFlags gcm_channel = 6;
    optional EnhancedBookmarksFlags obsolete_enhanced_bookmarks = 7;
    optional GcmInvalidationsFlags gcm_invalidations = 8;
    optional WalletSyncFlags wallet_sync = 9;
}

message FaviconData {
    optional bytes favicon = 1;
    optional int32 width = 2;
    optional int32 height = 3;
}

message FaviconImageSpecifics {
    optional string favicon_url = 1;
    optional FaviconData favicon_web = 2;
    optional FaviconData favicon_web_32 = 3;
    optional FaviconData favicon_touch_64 = 4;
    optional FaviconData favicon_touch_precomposed_64 = 5;
}

message FaviconTrackingSpecifics {
    optional string favicon_url = 1;
    optional int64 last_visit_time_ms = 3;
    optional bool is_bookmarked = 4;
}

message HistoryDeleteDirectiveSpecifics {
    optional GlobalIdDirective global_id_directive = 1;
    optional TimeRangeDirective time_range_directive = 2;
}

message GlobalIdDirective {
    optional int64 global_id = 1;
    optional int64 start_time_usec = 2;
    optional int64 end_time_usec = 3;
}

message TimeRangeDirective {
    optional int64 start_time_usec = 1;
    optional int64 end_time_usec = 2;
}

message NigoriKey {
    optional string name = 1;
    optional bytes user_key = 2;
    optional bytes encryption_key = 3;
    optional bytes mac_key = 4;
}

message NigoriKeyBag {
    optional NigoriKey key = 2;
}

message NigoriSpecifics {
    optional EncryptedData encryption_keybag = 1;
    optional bool keybag_is_frozen = 2;
    optional bool encrypt_bookmarks = 13;
    optional bool encrypt_preferences = 14;
    optional bool encrypt_autofill_profile = 15;
    optional bool encrypt_autofill = 16;
    optional bool encrypt_themes = 17;
    optional bool encrypt_typed_urls = 18;
    optional bool encrypt_extensions = 19;
    optional bool encrypt_sessions = 20;
    optional bool encrypt_apps = 21;
    optional bool encrypt_search_engines = 22;
    optional bool encrypt_everything = 24;
    optional bool encrypt_extension_settings = 25;
    optional bool encrypt_app_notifications = 26;
    optional bool encrypt_app_settings = 27;
    optional bool sync_tab_favicons = 29;
    optional PassphraseType passphrase_type = 30 [default = IMPLICIT_PASSPHRASE];
    optional EncryptedData keystore_decryptor_token = 31;
    optional int64 keystore_migration_time = 32;
    optional int64 custom_passphrase_time = 33;
    optional bool encrypt_dictionary = 34;
    optional bool encrypt_favicon_images = 35;
    optional bool encrypt_favicon_tracking = 36;
    optional bool encrypt_articles = 37;
    optional bool encrypt_app_list = 38;
    optional bool encrypt_autofill_wallet_metadata = 39;

    enum PassphraseType {
        IMPLICIT_PASSPHRASE = 1;
        KEYSTORE_PASSPHRASE = 2;
        FROZEN_IMPLICIT_PASSPHRASE = 3;
        CUSTOM_PASSPHRASE = 4;
    }
}

message ManagedUserSettingSpecifics {
    optional string name = 1;
    optional string value = 2;
}

message ManagedUserSharedSettingSpecifics {
    optional string mu_id = 1;
    optional string key = 2;
    optional string value = 3;
    optional bool acknowledged = 4 [default = false];
}

message ManagedUserSpecifics {
    optional string id = 1;
    optional string name = 2;
    optional bool acknowledged = 3 [default = false];
    optional string master_key = 4;
    optional string chrome_avatar = 5;
    optional string chromeos_avatar = 6;
    optional string password_signature_key = 7;
    optional string password_encryption_key = 8;
}

message ManagedUserWhitelistSpecifics {
    optional string id = 1;
    optional string name = 2;
}

message PasswordSpecificsData {
    optional int32 scheme = 1;
    optional string signon_realm = 2;
    optional string origin = 3;
    optional string action = 4;
    optional string username_element = 5;
    optional string username_value = 6;
    optional string password_element = 7;
    optional string password_value = 8;
    optional bool ssl_valid = 9;
    optional bool preferred = 10;
    optional int64 date_created = 11;
    optional bool blacklisted = 12;
    optional int32 type = 13;
    optional int32 times_used = 14;
    optional string display_name = 15;
    optional string avatar_url = 16;
    optional string federation_url = 17;
}

message PasswordSpecifics {
    optional EncryptedData encrypted = 1;
    optional PasswordSpecificsData client_only_encrypted_data = 2;
}

message PreferenceSpecifics {
    optional string name = 1;
    optional string value = 2;
}

message PriorityPreferenceSpecifics {
    optional PreferenceSpecifics preference = 1;
}

message SearchEngineSpecifics {
    optional string short_name = 1;
    optional string keyword = 2;
    optional string favicon_url = 3;
    optional string url = 4;
    optional bool safe_for_autoreplace = 5;
    optional string originating_url = 6;
    optional int64 date_created = 7;
    optional string input_encodings = 8;
    optional bool show_in_default_list = 9;
    optional string suggestions_url = 10;
    optional int32 prepopulate_id = 11;
    optional bool autogenerate_keyword = 12;
    optional string instant_url = 15;
    optional int64 last_modified = 17;
    optional string sync_guid = 18;
    optional string alternate_urls = 19;
    optional string search_terms_replacement_key = 20;
    optional string image_url = 21;
    optional string search_url_post_params = 22;
    optional string suggestions_url_post_params = 23;
    optional string instant_url_post_params = 24;
    optional string image_url_post_params = 25;
    optional string new_tab_url = 26;
}

message SessionSpecifics {
    optional string session_tag = 1;
    optional SessionHeader header = 2;
    optional SessionTab tab = 3;
    optional int32 tab_node_id = 4 [default = -1];
}

message SessionHeader {
    optional SessionWindow window = 2;
    optional string client_name = 3;
    optional SyncEnums.DeviceType device_type = 4;
}

message SessionWindow {
    optional int32 window_id = 1;
    optional int32 selected_tab_index = 2 [default = -1];
    optional BrowserType browser_type = 3 [default = TYPE_TABBED];
    optional int32 tab = 4;

    enum BrowserType {
        TYPE_TABBED = 1;
        TYPE_POPUP = 2;
    }
}

message SessionTab {
    optional int32 tab_id = 1;
    optional int32 window_id = 2;
    optional int32 tab_visual_index = 3 [default = -1];
    optional int32 current_navigation_index = 4 [default = -1];
    optional bool pinned = 5 [default = false];
    optional string extension_app_id = 6;
    optional TabNavigation navigation = 7;
    optional bytes favicon = 8;
    optional FaviconType favicon_type = 9;
    optional string favicon_source = 11;
    optional uint64 variation_id = 12;

    enum FaviconType {
        TYPE_WEB_FAVICON = 1;
    }
}

message TabNavigation {
    optional string virtual_url = 2;
    optional string referrer = 3;
    optional string title = 4;
    optional string state = 5;
    optional SyncEnums.PageTransition page_transition = 6 [default = TYPED];
    optional SyncEnums.PageTransitionRedirectType redirect_type = 7;
    optional int32 unique_id = 8;
    optional int64 timestamp_msec = 9;
    optional bool navigation_forward_back = 10;
    optional bool navigation_from_address_bar = 11;
    optional bool navigation_home_page = 12;
    optional bool navigation_chain_start = 13;
    optional bool navigation_chain_end = 14;
    optional int64 global_id = 15;
    optional string search_terms = 16;
    optional string favicon_url = 17;
    optional BlockedState blocked_state = 18 [default = STATE_ALLOWED];
    optional string content_pack_categories = 19;
    optional int32 http_status_code = 20;
    optional int32 obsolete_referrer_policy = 21 [default = 1];
    optional bool is_restored = 22;
    optional NavigationRedirect navigation_redirect = 23;
    optional string last_navigation_redirect_url = 24;
    optional int32 correct_referrer_policy = 25 [default = 1];

    enum BlockedState {
        STATE_ALLOWED = 1;
        STATE_BLOCKED = 2;
    }
}

message NavigationRedirect {
    optional string url = 1;
}

message SyncedNotificationAppInfoSpecifics {
}

message SyncedNotificationSpecifics {
}

message ThemeSpecifics {
    optional bool use_custom_theme = 1;
    optional bool use_system_theme_by_default = 2;
    optional string custom_theme_name = 3;
    optional string custom_theme_id = 4;
    optional string custom_theme_update_url = 5;
}

message TypedUrlSpecifics {
    optional string url = 1;
    optional string title = 2;
    optional bool hidden = 4;
    optional int64 visits = 7 [packed = true];
    optional int32 visit_transitions = 8 [packed = true];
}

message UniquePosition {
    optional bytes value = 1;
    optional bytes compressed_value = 2;
    optional uint64 uncompressed_length = 3;
    optional bytes custom_compressed_v1 = 4;
}

message WifiCredentialSpecifics {
    optional bytes ssid = 1;
    optional SecurityClass security_class = 2;
    optional bytes passphrase = 3;

    enum SecurityClass {
        SECURITY_CLASS_INVALID = 0;
        SECURITY_CLASS_NONE = 1;
        SECURITY_CLASS_WEP = 2;
        SECURITY_CLASS_PSK = 3;
    }
}

message ProfilingData {
    optional int64 meta_data_write_time = 1;
    optional int64 file_data_write_time = 2;
    optional int64 user_lookup_time = 3;
    optional int64 meta_data_read_time = 4;
    optional int64 file_data_read_time = 5;
    optional int64 total_request_time = 6;
}

message EntitySpecifics {
    optional EncryptedData encrypted = 1;
    optional AutofillSpecifics autofill = 31729;
    optional BookmarkSpecifics bookmark = 32904;
    optional PreferenceSpecifics preference = 37702;
    optional TypedUrlSpecifics typed_url = 40781;
    optional ThemeSpecifics theme = 41210;
    optional AppNotification app_notification = 45184;
    optional PasswordSpecifics password = 45873;
    optional NigoriSpecifics nigori = 47745;
    optional ExtensionSpecifics extension = 48119;
    optional AppSpecifics app = 48364;
    optional SessionSpecifics session = 50119;
    optional AutofillProfileSpecifics autofill_profile = 63951;
    optional SearchEngineSpecifics search_engine = 88610;
    optional ExtensionSettingSpecifics extension_setting = 96159;
    optional AppSettingSpecifics app_setting = 103656;
    optional HistoryDeleteDirectiveSpecifics history_delete_directive = 150251;
    optional SyncedNotificationSpecifics synced_notification = 153108;
    optional SyncedNotificationAppInfoSpecifics synced_notification_app_info = 235816;
    optional DeviceInfoSpecifics device_info = 154522;
    optional ExperimentsSpecifics experiments = 161496;
    optional PriorityPreferenceSpecifics priority_preference = 163425;
    optional DictionarySpecifics dictionary = 170540;
    optional FaviconTrackingSpecifics favicon_tracking = 181534;
    optional FaviconImageSpecifics favicon_image = 182019;
    optional ManagedUserSettingSpecifics managed_user_setting = 186662;
    optional ManagedUserSpecifics managed_user = 194582;
    optional ManagedUserSharedSettingSpecifics managed_user_shared_setting = 202026;
    optional ManagedUserWhitelistSpecifics managed_user_whitelist = 306060;
    optional ArticleSpecifics article = 223759;
    optional AppListSpecifics app_list = 229170;
    optional WifiCredentialSpecifics wifi_credential = 218175;
    optional AutofillWalletSpecifics autofill_wallet = 306270;
    optional WalletMetadataSpecifics wallet_metadata = 330441;
}

message SyncEntity {
    optional string id_string = 1;
    optional string parent_id_string = 2;
    optional string old_parent_id = 3;
    required int64 version = 4;
    optional int64 mtime = 5;
    optional int64 ctime = 6;
    required string name = 7;
    optional string non_unique_name = 8;
    optional int64 sync_timestamp = 9;
    optional string server_defined_unique_tag = 10;
    optional BookmarkData bookmarkdata = 11;
    optional int64 position_in_parent = 15;
    optional string insert_after_item_id = 16;
    optional bool deleted = 18 [default = false];
    optional string originator_cache_guid = 19;
    optional string originator_client_item_id = 20;
    optional EntitySpecifics specifics = 21;
    optional bool folder = 22 [default = false];
    optional string client_defined_unique_tag = 23;
    optional bytes ordinal_in_parent = 24;
    optional UniquePosition unique_position = 25;
    optional AttachmentIdProto attachment_id = 26;

    message BookmarkData {
        required bool bookmark_folder = 12;
        optional string bookmark_url = 13;
        optional bytes bookmark_favicon = 14;
    }
}

message ChromiumExtensionsActivity {
    optional string extension_id = 1;
    optional uint32 bookmark_writes_since_last_commit = 2;
}

message ClientConfigParams {
    optional int32 enabled_type_ids = 1;
    optional bool tabs_datatype_enabled = 2;
}

message CommitMessage {
    optional SyncEntity entries = 1;
    optional string cache_guid = 2;
    optional ChromiumExtensionsActivity extensions_activity = 3;
    optional ClientConfigParams config_params = 4;
    optional DataTypeContext client_contexts = 5;
}

message GetUpdateTriggers {
    optional string notification_hint = 1;
    optional bool client_dropped_hints = 2;
    optional bool invalidations_out_of_sync = 3;
    optional int64 local_modification_nudges = 4;
    optional int64 datatype_refresh_nudges = 5;
    optional bool server_dropped_hints = 6;
    optional bool initial_sync_in_progress = 7;
    optional bool sync_for_resolve_conflict_in_progress = 8;
}

message GarbageCollectionDirective {
    optional Type type = 1 [default = UNKNOWN];
    optional int64 version_watermark = 2;
    optional int32 age_watermark_in_days = 3;
    optional int32 max_number_of_items = 4;

    enum Type {
        UNKNOWN = 0;
        VERSION_WATERMARK = 1;
        AGE_WATERMARK = 2;
        MAX_ITEM_COUNT = 3;
    }
}

message DataTypeProgressMarker {
    optional int32 data_type_id = 1;
    optional bytes token = 2;
    optional int64 timestamp_token_for_migration = 3;
    optional string notification_hint = 4;
    optional GetUpdateTriggers get_update_triggers = 5;
    optional GarbageCollectionDirective gc_directive = 6;
}

message GetUpdatesMessage {
    optional int64 from_timestamp = 1;
    optional GetUpdatesCallerInfo caller_info = 2;
    optional bool fetch_folders = 3 [default = true];
    optional EntitySpecifics requested_types = 4;
    optional int32 batch_size = 5;
    optional DataTypeProgressMarker from_progress_marker = 6;
    optional bool streaming = 7 [default = false];
    optional bool need_encryption_key = 8 [default = false];
    optional bool create_mobile_bookmarks_folder = 1000 [default = false];
    optional SyncEnums.GetUpdatesOrigin get_updates_origin = 9;
    optional bool is_retry = 10 [default = false];
    optional DataTypeContext client_contexts = 11;
}

message AuthenticateMessage {
    required string auth_token = 1;
}

message DeprecatedMessage1 {
}

message DeprecatedMessage2 {
}

message ChipBag {
    optional bytes server_chips = 1;
}

message ClientStatus {
    optional bool hierarchy_conflict_detected = 1;
}

message DataTypeContext {
    optional int32 data_type_id = 1;
    optional bytes context = 2;
    optional int64 version = 3;
}

message ClientToServerMessage {
    required string share = 1;
    optional int32 protocol_version = 2 [default = 45];
    required Contents message_contents = 3;
    optional CommitMessage commit = 4;
    optional GetUpdatesMessage get_updates = 5;
    optional AuthenticateMessage authenticate = 6;
    optional DeprecatedMessage1 deprecated_field_9 = 9 [deprecated = true];
    optional string store_birthday = 7;
    optional bool sync_problem_detected = 8 [default = false];
    optional DebugInfo debug_info = 10;
    optional ChipBag bag_of_chips = 11;
    optional string api_key = 12;
    optional ClientStatus client_status = 13;
    optional string invalidator_client_id = 14;

    enum Contents {
        COMMIT = 1;
        GET_UPDATES = 2;
        AUTHENTICATE = 3;
        DEPRECATED_4 = 4;
    }
}

message GetCrashInfoRequest {
    optional string crash_id = 1;
    optional int64 crash_time_millis = 2;
}

message GetCrashInfoResponse {
    optional string stack_id = 1;
    optional int64 crash_time_millis = 2;
}

message CommitResponse {
    optional EntryResponse entryresponse = 1;

    enum ResponseType {
        SUCCESS = 1;
        CONFLICT = 2;
        RETRY = 3;
        INVALID_MESSAGE = 4;
        OVER_QUOTA = 5;
        TRANSIENT_ERROR = 6;
    }

    message EntryResponse {
        required ResponseType response_type = 2;
        optional string id_string = 3;
        optional string parent_id_string = 4;
        optional int64 position_in_parent = 5;
        optional int64 version = 6;
        optional string name = 7;
        optional string non_unique_name = 8;
        optional string error_message = 9;
        optional int64 mtime = 10;
    }
}

message GetUpdatesResponse {
    optional SyncEntity entries = 1;
    optional int64 new_timestamp = 2;
    optional int64 deprecated_newest_timestamp = 3;
    optional int64 changes_remaining = 4;
    optional DataTypeProgressMarker new_progress_marker = 5;
    optional bytes encryption_keys = 6;
    optional DataTypeContext context_mutations = 7;
}

message GetUpdatesMetadataResponse {
    optional int64 changes_remaining = 1;
    optional DataTypeProgressMarker new_progress_marker = 2;
}

message GetUpdatesStreamingResponse {
    optional SyncEntity entries = 1;
}

message UserIdentification {
    required string email = 1;
    optional string display_name = 2;
    optional string obfuscated_id = 3;
}

message AuthenticateResponse {
    optional UserIdentification user = 1;
}

message ThrottleParameters {
    required int32 min_measure_payload_size = 1;
    required double target_utilization = 2;
    required double measure_interval_max = 3;
    required double measure_interval_min = 4;
    required double observation_window = 5;
}

message ClientToServerResponse {
    optional CommitResponse commit = 1;
    optional GetUpdatesResponse get_updates = 2;
    optional AuthenticateResponse authenticate = 3;
    optional SyncEnums.ErrorType error_code = 4 [default = UNKNOWN];
    optional string error_message = 5;
    optional string store_birthday = 6;
    optional ClientCommand client_command = 7;
    optional ProfilingData profiling_data = 8;
    optional DeprecatedMessage2 deprecated_field_9 = 9 [deprecated = true];
    optional GetUpdatesMetadataResponse stream_metadata = 10;
    optional GetUpdatesStreamingResponse stream_data = 11;
    optional int32 migrated_data_type_id = 12;
    optional Error error = 13;
    optional ChipBag new_bag_of_chips = 14;

    message Error {
        optional SyncEnums.ErrorType error_type = 1 [default = UNKNOWN];
        optional string error_description = 2;
        optional string url = 3;
        optional SyncEnums.Action action = 4 [default = UNKNOWN_ACTION];
        optional int32 error_data_type_ids = 5;
    }
}

message EventRequest {
    optional SyncDisabledEvent sync_disabled = 1;
}

message EventResponse {
}

message SyncDisabledEvent {
    optional string cache_guid = 1;
    optional string store_birthday = 2;
}
`;
