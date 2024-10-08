// This is just an example,
// so you can safely delete all default props below

export default {
  general: {
    cancel: 'Cancel',
    OK: 'Ok',
    no_changes: 'No changes to show.',
    save_changes: 'Save changes',
    undo: 'Undo',
  },
  search: {
    search: 'Search',
    search_box_text: 'Find events, artists, places...',
    tags: 'Tags',
    events: 'Events',
    locations: 'Locations',
  },
  list_view: {
    search: 'Search',
    events: 'events',
    artists: 'artists',
    places: 'places',
    country: 'Country',
    state: 'State',
    region: 'Region',
    locality: 'Town or city',
    no_results: 'No results',
    show_filters: 'Show filters',
    hide_filters: 'Hide filters',
  },
  error_codes: {
    USERNAME_TAKEN: 'Username already taken',
    EMAIL_ALREADY_REGISTERED: 'Email already registered',
    AUTH_FAIL: 'Invalid credentials',
    ACCOUNT_DISABLED:
      'Account is temporarily disabled. Contact info@partymap.com',
    ACCOUNT_PENIDNG: 'Account has not been activated. Check your email!',
    no_location:
      'Check that partymap.com has permission to access your location.',
  },
  user_profile: {
    my_events: 'My events',
    delete: 'Delete',
    edit: 'Edit',
    delete_event: 'Delete event',
    delete_event_confirm:
      "Are you sure you want to delete this event? This can't be undone",
    pending_moderation: 'Pending moderation',
    only_visible_to_you: 'Only visible to you',
  },
  manage_account: {
    password: 'Password',
    update_password: 'Update password',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    password_updated: 'Your password has been updated.',
    no_password_message: 'You have not yet set a password.',
    facebook_login_message_1: 'Your account was created with Facebook Login.',
    facebook_login_message_2:
      'You must create a password below if you would like to be able to log in with your email address.',
    email_address: 'Email address',
    update_email: 'Update email address',
    email_verification: 'Email verification',
    email_verification_msg:
      "We've sent you a verification email. You'll need to click the link in the email to complete the process.",
    email_updated: 'Your email address has been updated',
    email_updated_msg: 'You can now log in with this email address',
    email_verification_error_msg:
      'There was a problem verifying your email. Please check that the URL is correct. Contact info@partymap.com for support.',
    delete_account: 'Delete account',
    delete_account_msg:
      'Deleting your account will also delete all of your contributions to PartyMap.',
    delete_account_confirm: 'Are you sure you want to delete your account?',
    deleting_account: 'Deleting account',
    no_way_back: "There's no going back now...",
    access_level: 'Access Level',
    your_access_level_is: 'Your account access level is: ',
    role_0: 'Regular User',
    role_0_message: 'You do not have the ability to create events.',
    role_10: 'Event Host',
    role_10_message: 'You have the ability to create events.',
    become_an_event_host: 'Become an event host',
  },
  auth: {
    host_login: 'Host login',
    login: 'Login',
    login_to_partymap: 'Log in',
    request_invite: 'Request host account',
    invite_email_subject: 'Invitation request',
    invite_email_body:
      'Hi, my name is... %0A%0A%0AI am from...%0A%0AI want to be on Partymap because... %0A%0AThe events me or my organization host are... %0A%0A%0A%0AThanks!',
    request_an_invitation: 'Request an invitation',
    only_verified_hosts: 'Only verified hosts can post events to PartyMap.',
    promo_message: 'Make it easier for people to find out about your events',
    request_invite_message:
      'Tell us a little bit about yourself and the events that you or your organization host and we will get back to you.',
    welcome_back: 'Welcome back!',
    welcome: 'Welcome',
    logout: 'Logout',
    password: 'Password',
    password_confirm: 'Confirm password',
    username: 'Username',
    email: 'Email address',
    identifier: 'Username or email',
    // eslint-disable-next-line
    real_name_not_visible: "Your real name won't be shown on the site.",
    only_save_email: 'We only save your email address.',
    username_letters_and_numbers:
      'Username must contain letters and number only',
    remember_me: 'Remember me',
    create: 'Create Profile',
    create_message:
      'Choose a username that represents your organization or your events.',
    back_to_login: 'Back to login',
    log_in_with_facebook: 'Continue with Facebook',
    sign_up_with_email: 'Sign up with email address',
    or: 'or',
    sign_up: 'Sign Up',
    sign_up_for_account: 'Create your account',
    account_created: "You're on your way!",
    account_created_msg:
      "We've sent you an account activation email. You'll need to check it out and activate your account before logging in.",
    login_error: 'Incorrect username or password',
    choose_username: 'Choose a username',
    choose_username_message:
      'Your username is how other people will see you on PartyMap. You can use your real name, a psuedonym or your organizations name.',
    choose_username_requirements:
      'Your username must only contain letters and numbers.',
    continue: 'Continue',
    account_activated: 'Account activated',
    account_acctivated_msg:
      'Welcome to PartyMap! You can now log in to your account.',
    account_activate_error_title: 'Hmmm...',
    account_activate_error_msg:
      'There was a problem activating your account. Please check that the URL is correct. Contact info@partymap.com for support.',
    account_already_activated_error_tilte: "You're all good!",
    account_already_activated_error_msg:
      'Your account has already been activated',
    forgot_password: 'Forgot your password?',
    forgot_password_message:
      "We'll send you an email containing a link to a page where you can reset your password.",
    reset_password: 'Reset password',
    nearly_there: 'Nearly there!',
    success: 'Success!',
    password_reset_email_sent: "We've sent you an email, check your inbox!",
    your_pw_has_been_reset_and_logged_in_as:
      'Your password has been reset and you are now logged in',
  },
  home: {
    popular_tags: 'Popular tags',
    upcoming_near_you: 'Events nearby',
    featured_events: 'Featured',
    recently_added: 'Recently added',
    recent_edits: 'Recent edits',
  },
  event: {
    event: 'Event',
    events_at: 'There are several events at this location: ',
    more_dates: 'Show more',
    show_less: 'Show less',
    favorite: 'Save to favorites',
    favorited: 'Remove from favorites',
    edit_event: 'Edit Event',
    add_photos: 'Upload photos of this event',
    add_lineup_poster: 'Add lineup poster',
    upload_images: 'Add photos',
    update_event_logo: 'Update event logo',
    delete_event: 'Delete Event',
    description: 'Description',
    tags: 'Tags',
    dates: 'Dates',
    photos: 'Photos',
    done: 'Done',
    upload_new_logo: 'Upload new logo',
    go_to_website: 'Website',
    get_tickets: 'Get Tickets',
    share: 'Share',
    add_tags: 'Add tags',
    last_updated: 'Last updated',
    by: 'by',
    revisions: 'revisions',
    edit: 'edit page',
    updating_event: 'Updating event',
    edit_name: 'Edit name',
    official_page: 'Official page',
    save_event: 'Save',
    unsave_event: 'Unsave',
  },
  add_event: {
    please_select_an_option: 'Submit an event:',
    event_i_know_about: "I'm not the host",
    event_i_know_about_msg:
      'Anyone can submit an event to PartyMap, as long as the event information is already public on the internet.',
    event_i_know_about_msg_long:
      'Anyone can submit an event to PartyMap, as long as the event information is already public on the internet. Anyone will be able update the event page if the information becomes out of date. All events are moderated before they show on the map.',
    i_am_host: "I'm the host",
    i_am_host_msg:
      'Login required. We may also ask for verification before publishing your event.',
    add_your_event: 'Submit your event',
    add_public_event: 'Submit an event',
  },
  sidebar: {
    home: 'Home',
    explore: 'Explore Map',
    favorites: 'Favorites',
    add_event: 'Add an Event',
    dark_mode: 'Dark Mode',
    login: 'Log in',
    logout: 'Log out',
    search: 'Search',
    clear_search: 'Clear search',
    my_account: 'Account',
    about: 'About',
    profile: 'Profile',
    location: 'Nearby',
    more: 'More',
    events_nearby: 'Showing events near',
    showing_favorites: 'Showing favorites',
    finding_location: 'Finding location...',
    no_upcoming_events_in_area: 'No upcoming events here',
  },
  landing_page: {
    improve_location: 'Improve location',
    top_artists_in_area: 'Top artists',
    top_tags_in_area: 'Top tags',
    events_within: 'Events within',
    all_upcoming_events: 'Events around the world',
    no_artists_in_area: 'There are no artists to show in this area.',
    no_tags_in_area: 'There are no tags to show in this area.',
    no_events_in_area: 'There are no events in this radius.',
    tagline: 'THE GLOBAL DIRECTORY OF FESTIVALS AND EVENTS',
    explore_map: 'EXPLORE THE MAP',
    explore: 'EXPLORE',
  },
  location_status: {
    events_on_map: 'Showing events on map',
    show_all: 'Show all events',
    show_on_map: 'Follow map',
    showing_all: 'Showing all events',
    events_near: 'Events near',
    all_events: 'Events around the world:',
    radius: 'Radius',
    events_within: 'Upcoming near',
  },
  nav: {
    settings: 'Settings',
    dark_mode: 'Dark mode',
    watercolor: 'Watercolour',
    satellite_map: 'Satellite',
    transport_map: 'Transport',
    highcontrast_map: 'High contrast',
    back: 'Back',
    back_to_map: 'Back to map',
  },
  shortcuts: {
    near_me_today: 'Show events on nearby today',
    near_me_weekend: 'Show events on nearby this weekend',
    all: 'Show all events',
  },
  top_controls: {
    nearby: 'Nearby',
    tag_search: 'search tags, events or a location',
    today: 'Today',
    today_d: 'Happening today',
    next_weekend: 'Next weekend',
    weekend: 'This weekend',
    weekend_d: 'Happening this weekend',
    week: 'This week',
    week_d: 'Happening in the next 7 days',
    month: 'Events this month',
    more_months: 'More months',
    months: 'Months',
    locality: 'Location',
    tags: 'Tags',
    month_d: 'Happening this month',
    all: 'All',
    all_d: 'Until the end of time',
    custom: 'Custom',
    custom_d: 'Select date range',
    select_dates: 'Dates',
    select_duration: 'Duration',
    select_size: 'Size',
    select_artist: 'Artists',
    select_tags: 'Type',
    top_tags_in_area: 'Top tags',
    top_artists_in_area: 'Top artists',
    search_artists: 'Search artists',
    artist_page: 'View profile',
    search_tags: 'Search tags',
    set_date: 'Done',
    cancel: 'Cancel',
    date: 'Date (Soonest)',
    one_day: '1 day or shorter',
    two_days: '2 days',
    three_days: '3 days',
    four_days: '4 days',
    five_days_plus: '5 days or longer',
    sort_results_by: 'Sort results by:',
    map_options: 'Map style:',
    sort_by_date: 'Sort by date (Soonest)',
    distance: 'Distance (Closest)',
    shortcuts: 'Shortcuts',
    sort_by_distance: 'Sort by distance (Closest)',
    all_events: 'Showing all events',
    less_than_one_thousand: 'Less than 1000 people',
    more_than_fifty_thousand: 'More than 50,000 people',
    people: 'people',
    saved_events: 'Saved events',
    quick_submit: 'Add an an event!',
  },
  add: {
    info: 'Info',
    start: 'Start',
    end: 'End',
    location: 'Location',
    schedule: 'Schedule',
    continue: 'Continue',
    add: 'Submit to PartyMap',
    name: 'Event name',
    description: 'Event description',
    tags: 'Tags',
    tags_msg: 'For example: free, drum and bass, burn',
    url: 'Optional link to main event webpage',
    ticketing_url: 'Link to ticketing page',
    select_location: 'Select location',
    suggested_tags:
      'Some ideas: festival, cultural, spiritual, camping, free, hiphop, trance, metal, alcohol free, psychedelic, drug testing, wheelchair accessible...',
    enter_location: 'Enter location',
    location_caption: 'Search for a venue or an address.',
    date: 'Date and Time',
    review: 'Review',
    recurrence: 'Event Schedule',
    recurrence_caption: 'Select how often this event occurs.',
    event_start: 'Event start',
    event_end: 'Event end',
    hour: 'Hour',
    minutes: 'Minutes',
    ampm: 'AM/PM',
    please_select_date_first: 'Please select the date and time first',
    please_select_date_msg:
      'Select a range if the event will happen over multiple days',
    please_select_date_msg_2:
      "If it's a one-day event you will need to double click to select the day.",
    start_time: 'Start time',
    remove_start_time: '- Remove start time',
    end_date: 'Select event end date',
    end_date_caption:
      'Dont forget to select the next day if the event ends after midnight!',
    end_time: 'End time',
    remove_end_time: 'Remove end time',
    once: 'One-off event',
    every: 'Every',
    every_: 'Every...',
    every_second: 'Every second',
    every_second_: 'Every second...',
    day: 'day',
    day_of: 'day of',
    of: 'of',
    on: 'on',
    at: 'at',
    of_every_month: 'of every month',
    of_every_second_month: 'of every second month',
    every_year: 'every year',
    every_second_year: 'every second year',
    week: 'week',
    month: 'month',
    year: 'year',
    frequency: 'Frequency',
    type: 'Type',
    added_to_map: 'has been added to the map!',
    size_msg: 'How many people will be attending this event?',
    size_msg2:
      'Just a rough estimate - please round to the nearest hundred or thousand attendees',
    size: 'Size',
    size_how_many: 'Size',
    url: 'External URL',
    url_msg: 'A link to the website or Facebook page.',
    add_event_date: 'Add date',
    uploading_event: 'Uploading this event to PartyMap...',
    pending_moderation: 'Pending moderation',
    pending_moderation_msg:
      'This event will show on the map after we have approved it.',
    lineup: 'Lineup',
    lineup_msg:
      'Add artists and performance times to the lineup for this event. If there is more than one stage at this event you can use the plus sign to add additional stages.',
    required_information: 'Required information',
    additional_information: 'Additional information',
    an_event_already_exists: 'An event already exists with a simlar name ',
    dont_add_same_twice:
      "Please don't add the same event twice, instead you should update the original page.",
    dont_add_same_twice2:
      'If this is a different event you can ignore this warning.',
    event_poster_image: 'Event poster/cover image',
    event_poster_image_msg: 'Upload a promotional image for this event.',
    event_poster_image_msg2:
      'We recommend a portrait poster for the best look!',
  },
  add_event_date: {
    add_new_event_date: 'Add event date',
    date_time_required: 'Date and time (required)',
    location_required: 'Location (required)',
    adding_event_date: 'Adding event date',
  },
  media_upload: {
    caption: 'Caption',
    remove: 'Remove',
    add_media: 'Select photos',
    add_media_msg:
      'Please make sure you have the consent of all identifiable people in any photos uploaded, and make sure you have the rights to upload the image. ',
    upload_media: 'Upload media',
    upload: 'Upload',
  },
  description: {
    edit_description: 'Update main description',
    keep_it_short: 'Keep it short and sweet.',
    summary: 'Summary',
    attribute_msg: 'Description source URL',
    attribute_msg_long:
      'If you did not write this yourself, please give the source.',
    summary_msg:
      'A short description that will be shown at the top of the event page.',
    detailed_description: 'Detailed description',
    detailed_description_msg: 'A detailed description of this upcoming event.',
    put_more_details_in_event_date:
      'You can put a more detailed description in the event date section further down the page.',
    title: "What's happening",
    edit: 'Edit',
    update: 'Update',
  },
  history: {
    title: 'Edit history',
    history: 'History',
  },
  activity: {
    activity: 'Activity',
    artists: 'artists',
    all_activity: 'All activity',
    view_all_activity: 'view all activity',
    updated: 'updated',
    created: 'added',
    reverted: 'reverted',
    deleted: 'deleted',
    version: 'version',
    revert: 'undo',
    revision: 'revision',
    undid: 'undid',
    to_revision: 'to version',
    this_event: 'this event',
    the_event_date: 'the event date',
    by: 'by',
    old: 'old',
    new: 'new',
    older: 'older',
    an_image: 'an image',
    a_video: 'a video',
    location_id: 'location',
    cancelled: 'cancelled',
    name: 'name',
    tz: 'timezone',
    the_position_of: 'the position of',
    position: 'position',
    type: 'type',
    thumb_filename: 'thumbnail',
    start_date_time: 'start time',
    end_date_time: 'end time',
    default_url: 'default URL',
    url: 'external URL',
    default_location_id: 'default location',
    added_a_tag: 'added tag',
    removed_a_tag: 'removed tag',
    description: 'description',
    start_naive: 'start time',
    end_naive: 'end time',
    page_versions: 'Page history',
    page_versions_message:
      'Use the slider to browse previous versions of this page. ',
    revert_to_this_version: 'Revert to version',
    recurring_rule: 'schedule',
    the_recurring_rule_for_event: 'the schedule',
    a_recurring_rule_for_event: 'a schedule',
    a_tag: 'a tag',
    the_tag: 'the tag',
    load_more: 'Load more',
    sorted_by_recent: 'Sorted by most recent',
  },
  versions: {
    revert_changes: 'Revert changes',
  },
  contributors: {
    contributors: 'Contributors',
    contributors_msg: 'Users who have edited this page',
    edited_this_page: 'edited this page',
    time: 'time',
    times: 'times',
  },
  suggestions: {
    improve_this_page: 'Edit this page',
    improve_this_page_msg:
      'If the information on this page is incorrect you can help other people by updating it! All updates are moderated.',
    general: 'General',
    event_dates: 'Event dates',
    event_dates_msg: 'Specific dates (time, location, lineup and other info)',
    upcoming_dates: 'Upcoming dates',
    name: 'Event name',
    name_msg: 'The name of this event that is displayed everywhere',
    main_description: 'Main description',
    main_description_msg:
      'Edit the short summary that shows at the top of the event page',
    event_tags: 'Tags',
    event_tags_msg: 'Add or remove tags that describe this event',
    add_date: 'New date',
    add_date_msg: 'Suggest a new upcoming date to this event page',
    add_schedule: 'Add Schedule',
    change_schedule: 'Change Schedule',
    schedule_msg:
      'PartyMap can automatically add future dates if this event happens on a regular basis',
    remove_schedule: 'Remove schedule',
    remove_schedule_msg:
      'Stop automatically generating dates if this event no longer happens on a regular basis',
    date: 'Date and time',
    date_msg: 'Update the date and time for this specific event date',
    location: 'Location',
    location_msg: 'Update the location for this specific event date',
    ed_description: 'Description',
    ed_description_msg:
      'Suggest changes to the description for this specific event date',
    url: 'External URL',
    url_msg:
      'Suggest a new URL that links to the events website or Facebook event page',
    cancelled: 'Cancel this event date',
    cancelled_msg: 'Has this date been cancelled? Let people know.',
    size: 'Size',
    size_msg: 'How many people will be at this event?',
    image: 'Cover image',
    image_message: 'Upload a new cover image',
    delete: 'Delete this date',
    delete_msg: "This date shouldn't be here, remove it completely",
    message: 'Message',
    submit_improvement: 'Submit improvement',
    tell_us_why_improvement_needed:
      'Tell us why this improvement is needed. Please give a source if possible.',
    upload_new_logo: 'Upload a new logo',
    upload_new_logo_msg: 'Please do not upload copyrighted images.',
    suggestions: 'Suggestions',
    suggested_edits_submitted_by_users: 'Suggested edits submitted by users',
    show_more: 'Show more dates',
    artists: 'Lineup',
    artists_msg:
      'Add artists and performance times to the lineup for this event. If there are several stages or the event happens over multiple days, you can organize the lineup by creating separate lists.',
    edit_artists_msg: 'Make changes to the lineup of this event date',
    existing_artists: 'Existing artists',
    add_artists: 'Add artists',
    captcha_required: "Captcha required if you're not logged in.",
  },
  artists: {
    add_time: 'Add time',
    remove_time: 'Remove time',
    links: 'Links',
    upcoming_events: 'Upcoming events',
    past_events: 'Past events',
    tags: 'Tags',
    description: 'Description',
  },
  gallery: {
    more: 'More',
    photos_and_videos: 'Photos and videos',
    edit_gallery: 'Edit media gallery',
    edit_gallery_message:
      'Upload content and arrange the media gallery. The first item will show as the main cover image. ',
    reorder: 'Re-order',
    uploading_media: 'Uploading media',
    do_do_do: 'Do do doo do..',
    video_conversion_msg:
      'Videos may take up to 10 minutes to be processed after uploading.',
  },
  event_dates: {
    upcoming_dates: 'Upcoming dates',
    no_upcoming_dates: 'No upcoming dates',
    this_event_doesnt_have_upcoming_dates:
      "This event doesn't have any upcoming dates",
    next_event: 'Next event',
    edit: 'Edit date',
    description: 'Event date details',
    event_details: 'Details:',
    delete_event_date: 'Delete event date',
    delete_event_date_confirm:
      'Are you sure you want to delete this event date?',
    done: 'Done',
    edit_message: 'Edit info about this specific date',
    edit_event_rrule: 'Edit recurrance',
    set_up_recurring_dates: 'Recurring schedule',
    set_up_recurring_dates_warning:
      'If you set an automatic recurrence rule, all upcoming dates will be deleted and replaced!',
    select_date_time_of_next_event:
      'Select the date and time of the next event',
    edit_event_rrule_message: 'Change how often this event occurs',
    manage_event_dates: 'Manage event dates',
    this_event_recurrs: 'This event recurrs',
    add_event_date_q: 'Add event date?',
    add_event_date_q_msg:
      "This event doesn't have any dates so it won't show on the map. If the event has not been completely cancelled, add a date for the next occurance of this event.",
    add_a_date: 'Add a date',
    ignore_add_date: 'Ignore (Event will be hidden)',
    upcoming_dates: 'Event dates:',
    past_dates: 'No upcoming dates.',
    change_schedule: 'Change schedule',
    remove_schedule: 'Mark as cancelled',
    remove_schedule_confirm:
      'Are you sure? All future scheduled dates will be deleted.',
    schedule_msg:
      'Schedule is enabled, future dates will be automatically generated.',
    lineup: 'Lineup:',
  },
  edit_event_date: {
    updating_event_date: 'Updating event date...',

    external_url: 'External URL',
    external_url_msg: 'Add a link to the website or Facebook page',
    size: 'Size',
    size_msg: 'Roughly how many people will be attending this event?',
    description: 'Description',
    description_msg: "What's happening on this date?",
    date: 'Date and time',
    date_msg:
      'Select the start and end date if this event happens over multiple days, or double click a date to select a single day. Time is in 24 hour format.',
    location: 'Event location',
    location_msg:
      "This search uses Google so most venues and places should show up. If it's in a paddock just type in the rough address",
    cancel: 'Mark this date as cancelled',
    cancel_msg:
      "Don't be a bloody dickhead, only do this if this date has been cancelled.",
    uncancel: 'Mark this date as happening',
    uncancel_msg:
      "This date was previously marked as cancelled. Are you really sure you want to mark is as 'happening'? Don't be a bloody dickhead.",
    delete: 'Delete this event date',
    delete_confirm_1: 'You are about to delete the event date',
    delete_confirm_2:
      "Don't be a bloody dickhead. Are you sure you want to continue?",
    submit_improvement: 'Submit improvement',
    submit_improvement_msg:
      'Tell us why this improvement is needed or give a source if relevant.',
    submitting: 'Submitting...',
    submitted: 'Suggestion submitted',
    submitted_msg:
      'Your suggestion will show on the page after it has been reviewd. Thanks for contirbuting to PartyMap!',
  },
  event_date_inline: {
    starts: 'Starts',
    ends: 'Ends',
    directions: 'Directions',
    add_info: 'Add a description for this specific date (for recurring events)',
    add_ticket_url: 'Add links to buy tickets',
    add_url: 'Add a link to the website or Facebook page',
    add_lineup: 'Add the lineup',
    show_all: 'Show all',
    show_less: 'Show less',
    add_size: 'Add the size of this event',
    size_people: 'people attending',
    cancelled: 'CANCELLED',
    mark_date_as_cancelled: 'Mark as cancelled',
    mark_date_as_happening: 'Mark event date as happening',
    add_missing_information: 'Edit this page',
    hide_missing_information: 'Hide missing information',
  },
  edit_event: {
    remove_schedule: 'Remove schedule',
    remove_schedule_msg:
      'Does the event not happen on a regular schedule anymore? This action will delete all future scheduled event dates.',
    updating_event: 'Updating event...',
  },
  tags: {
    tag_event: 'Edit tags',
    search_results: 'Search results',
    touch_to_add: 'Touch a tag to add it to this event.',
    existing_tags: 'Existing event tags',
    selected_tags: 'Selected tags',
    tagging_information: 'Tags with a negative score will be removed',
    search_for_tag: 'Search for tag',
    top_tags: 'Top tags',
  },
  contribution: {
    title: 'Contributions',
    contribute_to_this_event: 'Make a contribution',
    upload_photos: 'Add photos',
    pick_files: 'Pick files',
    abort_upload: 'Abort upload',
    upload_progress: 'Upload progress',
    submit: 'Submit',
    upvote: 'Upvote',
    downvote: 'Downvote',
    close: 'Close', // close window
    added_by: 'added by',
    created_this_event: 'created_this_event',
    best: 'Best',
    worst: 'Worst',
    newest: 'Newest',
    oldest: 'Oldest',
    add_label: 'Submit photos, an experience or a review.',
  },
  time: {
    time: 'time',
    happening_now: 'Happening now',
    happening_today: 'Happening today',
    month_ago: 'month ago',
    months_ago: 'months ago',
    seconds_ago: 'seconds ago',
    week_ago: 'week ago',
    weeks_ago: 'weeks ago',
    hour_ago: 'hour ago',
    hours_ago: 'hours ago',
    minute_ago: 'minutes ago',
    minutes_ago: 'minutes ago',
    days_ago: 'days ago',
    day_ago: 'day ago',
    day_away: 'day away',
    days_away: 'days away',
    week_away: 'week away',
    weeks_away: 'weeks away',
    month_away: 'month away',
    months_away: 'months away',
    every: 'Every',
    day: 'day',
    day_of_the_month: 'day of the month',
    of_the_month: 'of the month',
    'of every': 'of every',
    of: 'of',
    every_year: 'Every year',
    week: 'week',
    year: 'year',
    years: 'years',
    on_the: 'on the',
    month: 'month',
  },
  weekdays: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  months: {
    jan: 'January',
    feb: 'Febuary',
    mar: 'March',
    apr: 'April',
    may: 'May',
    jun: 'June',
    jul: 'July',
    aug: 'August',
    sep: 'September',
    oct: 'October',
    nov: 'November',
    dec: 'December',
  },
  ordinal_short: {
    1: '1st',
    2: '2nd',
    3: '3rd',
    4: '4th',
    5: '5th',
    6: '6th',
    7: '7th',
    8: '8th',
    9: '9th',
    10: '10th',
    11: '11th',
    12: '12th',
    13: '13th',
    14: '14th',
    15: '15th',
    16: '16th',
    17: '17th',
    18: '18th',
    19: '19th',
    20: '20th',
    21: '21st',
    22: '22nd',
    23: '23rd',
    24: '24th',
    25: '25th',
    26: '26th',
    27: '27th',
    28: '28th',
    29: '29th',
    30: '30th',
    31: '31st',
  },
  ordinal_long: {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    '-1': 'last',
  },
  validation: {
    password_too_long: 'Password must be less than 100 characters.',
    password_too_short: 'Password too short.',
    password_must_match: 'Passwords must match.',
    username_too_long: 'Username must be less than 25 characters.',
    username_too_short: 'Username too short.',
    username_special_characters:
      'Username must not contain any special characters.',
    email_invalid: 'Email is invalid.',
    is_required: 'is required.',
    description_required: 'Description is required',
    name_required: 'Name is required',
    url_format: "whatever this is, it's not a URL.",
  },
  feedback: {
    feedback: 'Feedback',
    give_feedback: 'Give feedback',
    send: 'Send',
    give_feedback_msg:
      "Let me know what you like and don't like about PartyMap. Tell me your hopes and dreams. Share with me your darkest secrets.",
    give_feedback_msg_2:
      'If you would like a response please leave your email address.',
    contact_email: 'Contact email',
    sending_feedback: 'Sending feedback...',
    thanks: 'Thanks!',
    thanks_msg:
      "Your feedback has been sent. If you left us your email address, we'll get back to you soon.",
  },
  report: {
    report_event: 'Report event',
    sending_report: 'Sending report',
    please_tell_us_your_problem:
      'Please tell us what your problem is with this event.',
    message: 'Put your message here',
    report_sent: 'Your report has been sent',
    we_will_look_into_this_soon: 'We will look into this soon for you.',
    are_you_host: 'Are you this host? Claim this event page',
    are_you_host: 'Claim this event',
    claim_event_page: 'Claim this event',
    claim_message:
      'We need evidence that this is your event so that we can verify that you are the host. The easiest way is to become a verified host is to message PartyMap on',
    or_from_your_email:
      'from your official event account OR sign into a PartyMap account with an email address that has your official domain name in it. You can do this after submitting the event.',
    or: 'or',
    claim_message_2:
      'Once you are verified as the host you will have full control over your event page and the verified badge will show.',
    claim_input_msg:
      'Tell us how you would like to verify yourself as the host',
  },
  about: {
    message_2:
      'If your event has been listed by someone and you would like to have it removed, please look for the report button at the bottom of the event page. ',
    message_3:
      'Enjoying PartyMap? A lot of time and energy went into it, and server costs are ongoing. You can send a donation with',
    or: 'or',
    it_would_be_appreciated: ' - it would be much appreciated!',
    made_in_aotaeroa: 'Made with love in Aotearoa',
    read_privacy_policy: 'Privacy policy',
    read_terms_and_conditions: 'Terms and conditions',
    privacy_policy: 'Privacy policy',
    terms_and_conditions: 'Terms and conditions',
  },
};
