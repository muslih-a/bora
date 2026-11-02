// English language strings

export const en = {
  app_name: 'BoraScan',
  tagline: 'Fast Offline Borax Screening for Food Safety',
  screening_disclaimer: 'Initial screening result only. Must be confirmed through official accredited laboratory testing.',
  screening_disclaimer_short: 'Screening result only – not a final laboratory test.',

  // Navigation
  nav_home: 'Home',
  nav_history: 'History',
  nav_guide: 'Guide',
  nav_settings: 'Settings',

  // Actions
  btn_next: 'Next',
  btn_back: 'Back',
  btn_start: 'Start',
  btn_skip: 'Skip',
  btn_cancel: 'Cancel',
  btn_save: 'Save',
  btn_delete: 'Delete',
  btn_share_pdf: 'Share PDF',
  btn_scan_now: 'Scan now',
  btn_rescan: 'Re-scan',
  btn_ammonia_step: 'Proceed to ammonia test',
  btn_report_bpom: 'Report to BPOM',
  btn_test_again: 'Test again',
  btn_confirm: 'Confirm',
  btn_change: 'Change',
  btn_close: 'Close',

  // S01 Splash / Onboarding
  s01_slide1_title: 'Welcome to BoraScan',
  s01_slide1_desc: 'Rapidly screen for borax adulteration in food using BoraNata curcumin test strips and color reference cards.',
  s01_slide2_title: 'Simple & Accurate',
  s01_slide2_desc: 'Dip the strip, place it in the card slot, and take a photo. Works completely offline with zero server calls.',
  s01_slide3_title: 'Accessible for Everyone',
  s01_slide3_desc: 'Results are presented with symbols, tactile vibrations, speech, and high-contrast Okabe-Ito colors (WCAG 2.2).',
  s01_btn_start: 'Get Started',

  // S02 Home
  s02_title: 'BoraScan',
  s02_btn_new_test: 'Start New Test',
  s02_batch_card_title: 'Active Strip Batch',
  s02_batch_exp: 'Expires',
  s02_batch_change: 'Change / Scan QR',
  s02_last_result_title: 'Last Test Result',
  s02_no_previous_test: 'No test history yet.',
  s02_quick_history: 'View History',
  s02_quick_guide: 'User Guide & Printable Card',
  s02_quick_report_info: 'BPOM Reporting Info',

  // S03 Food Type
  s03_title: 'Select Food Type',
  s03_subtitle: 'What type of food are you screening?',
  s03_food_bakso: 'Meatball (Bakso)',
  s03_food_mi: 'Yellow / Wet Noodles (Mi)',
  s03_food_kerupuk: 'Crackers (Kerupuk)',
  s03_food_lontong: 'Rice Cakes (Lontong)',
  s03_food_lainnya: 'Other',
  s03_food_other_placeholder: 'Specify food type...',
  s03_note_label: 'Additional Note (optional)',
  s03_note_placeholder: 'E.g., purchased at local market...',

  // S04 Preparation Checklist
  s04_title: 'Sample Preparation',
  s04_subtitle: 'Perform steps 1–5 in order:',
  s04_step1_title: '1. Wear Gloves',
  s04_step1_desc: 'Wear clean disposable gloves to prevent oil or soap contamination on the sample.',
  s04_step2_title: '2. 1 Spoon of Food',
  s04_step2_desc: 'Mash or finely cut 1 tablespoon of food in a clean small plastic cup.',
  s04_step3_title: '3. 2 Spoons of Water',
  s04_step3_desc: 'Pour 2 tablespoons of clean water into the cup (1 : 2 dilution ratio).',
  s04_step4_title: '4. Knead / Stir 1 Minute',
  s04_step4_desc: 'Stir and knead the food thoroughly so soluble compounds dissolve into the water.',
  s04_step4_timer: 'Start Stir Timer (1:00)',
  s04_step5_title: '5. Rest for 2 Minutes',
  s04_step5_desc: 'Allow solids to settle for 2 minutes. We only dip into the clear liquid supernatant.',
  s04_step5_timer: 'Start Rest Timer (2:00)',
  s04_tts_tooltip: 'Read this step aloud',

  // S05 Dip
  s05_title: 'Dip the Strip',
  s05_subtitle: 'Dip the BoraNata test pad into the liquid supernatant for 5 seconds.',
  s05_countdown_btn: 'Start 5s Dip Timer',
  s05_countdown_active: 'Dipping pad...',
  s05_done_prompt: 'Remove strip and gently drain excess liquid on the rim.',

  // S06 Wait 10 Minutes
  s06_title: 'Wait for Color Reaction',
  s06_subtitle: 'The curcumin complex on the pad requires 10 minutes to react with borax.',
  s06_keep_awake: 'Screen stays awake during the countdown.',
  s06_timer_done_spoken: 'Time to scan! Place strip into the card PAD slot.',
  s06_skip_timer: 'Skip Timer (Research Mode)',

  // S07 Scan
  s07_title: 'Scan BoraScan Card',
  s07_ammonia_title: 'Scan Strip (Ammonia Step)',
  s07_instruction: 'Align the 4 card corners inside the frame. Hold the phone steady.',
  s07_hint_card: 'Card',
  s07_hint_distance: 'Distance',
  s07_hint_focus: 'Focus',
  s07_hint_glare: 'Glare',
  s07_gallery_btn: 'Pick Photo from Gallery',
  s07_torch_toggle: 'Flashlight',
  s07_shutter_btn: 'Take Photo',
  s07_auto_capturing: 'Position steady... Capturing in 1 second',

  // S08 Analysing
  s08_title: 'Analysing Strip...',
  s08_step1: 'Detecting card & 4 ArUco markers...',
  s08_step2: 'Correcting perspective & lighting calibration...',
  s08_step3: 'Reading PAD color values...',

  // S09 Rescan Needed
  s09_title: 'Re-scan Needed',
  s09_subtitle: 'The card could not be read reliably.',
  s09_reason_label: 'Reason:',
  s09_fix_label: 'Recommended Fix:',

  // S10 Result 0
  s10_title: 'Result: No Borax Detected',
  s10_badge_text: '0 ○ Safe (Screening)',
  s10_explanation: 'Borax level is below the strip detection limit (< 0.020%). Curcumin pad remains yellow.',

  // S11 Result 1 / 2
  s11_title_1: 'Result: Unclear Shift',
  s11_title_2: 'Result: Borax Suspected',
  s11_estimate_label: 'Estimated Borax Level:',
  s11_range_label: 'Range:',
  s11_next_card_title: 'Mandatory Next Step: Ammonia Drop Test',
  s11_next_card_desc: 'Certain alkaline foods can also trigger orange/red shades. Apply 1 drop of dilute ammonia to distinguish borax from mere alkalinity.',

  // S12 Ammonia Step
  s12_title: 'Ammonia Confirmation Step',
  s12_step1: 'Add 1 drop of dilute ammonia solution onto the test pad.',
  s12_step2: 'Wait 1 minute for the reaction to develop.',
  s12_timer_btn: 'Start 1-Minute Timer',
  s12_ready_to_scan: 'Ready to scan ammonia reaction!',

  // S13 Result B+
  s13_title: 'RESULT: BORAX CONFIRMED (B+)',
  s13_badge_text: 'B+ ⊗ POSITIVE BORAX',
  s13_warning_1: 'DO NOT EAT OR SELL THIS FOOD!',
  s13_warning_2: 'Borax is a hazardous chemical strictly prohibited in food.',
  s13_warning_3: 'Keep the remaining food in a sealed container if reporting to food safety authorities.',

  // S14 Result B-
  s14_title: 'RESULT: NOT BORAX (B−)',
  s14_badge_text: 'B− ⊖ NEGATIVE BORAX',
  s14_desc: 'No greenish-black color developed. The food is simply naturally alkaline (e.g. kansui or ash water in noodles).',

  // S15 Batch QR
  s15_title: 'Strip Batch Calibration',
  s15_scan_btn: 'Scan Sachet QR Code',
  s15_active_badge: 'ACTIVE',
  s15_make_active: 'Use This Batch',
  s15_batch_details: 'Calibration Parameters:',
  s15_slope_m: 'Slope (m)',
  s15_intercept_b: 'Intercept (b)',
  s15_lod: 'Limit of Detection (LOD)',
  s15_cutoff: 'Cut-off Threshold',
  s15_lin: 'Linearity Limit',

  // S16 Report BPOM
  s16_title: 'Report to HaloBPOM (WhatsApp)',
  s16_reporter_name: 'Reporter Name',
  s16_reporter_placeholder: 'Enter your full name...',
  s16_checkbox_agree: 'I understand this is an initial screening result requiring formal laboratory confirmation.',
  s16_btn_whatsapp: 'Send Report via WhatsApp',
  s16_btn_copy: 'Copy Report Text',
  s16_copied: 'Report text copied to clipboard!',
  s16_save_photo_hint: 'Attach the strip photo from your gallery if WhatsApp does not attach it automatically.',

  // S17 History
  s17_title: 'Test History',
  s17_empty: 'No test records saved yet.',
  s17_filter_all: 'All',

  // S18 History Detail
  s18_title: 'Test Details',
  s18_photo_initial: 'Initial Photo',
  s18_photo_ammonia: 'Ammonia Photo',

  // S19 Guide
  s19_title: 'BoraScan User Guide',
  s19_tab_steps: '9 Test Steps',
  s19_tab_card: 'Print Card',
  s19_tab_safety: 'Safety',
  s19_tab_faq: 'FAQ & Codes',

  // S20 Settings
  s20_title: 'Settings',
  s20_lang: 'Language',
  s20_sound: 'Spoken Audio (TTS)',
  s20_vibration: 'Haptic Feedback',
  s20_large_text: 'Large Text Mode',
  s20_high_contrast: 'High Contrast Mode',
  s20_default_reporter: 'Default Reporter Name',
  s20_research_mode: 'Research Mode (Experiments)',
  s20_clear_data: 'Clear All App Data',
  s20_clear_confirm: 'Are you sure you want to delete all saved test history and custom batches?',
  s20_about_title: 'About BoraScan',
  s20_about_text: 'BoraScan v1.0 – Offline computer vision borax screening app using colorimetric calibration cards.',
};
