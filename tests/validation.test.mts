import * as v from '../src/domain/usecases/validation.ts';
let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => { const ok = JSON.stringify(got) === JSON.stringify(want); ok ? pass++ : (fail++, console.log('FAIL', name, 'got', JSON.stringify(got), 'want', JSON.stringify(want))); };
const code = (e: v.ValidationError | null) => e?.code ?? null;
// mobile: country-aware validation
eq('IN mobile ok', code(v.validateMobile('9876543210', 'IN')), null);
eq('IN spaced ok', code(v.validateMobile('98765 43210', 'IN')), null);
eq('default country is IN', code(v.validateMobile('9876543210')), null);
eq('IN fake number', code(v.validateMobile('1234567890', 'IN')), 'mobileInvalid');
eq('IN too short', code(v.validateMobile('12345', 'IN')), 'mobileInvalid');
eq('mobile empty', code(v.validateMobile('  ', 'IN')), 'required');
eq('US number ok', code(v.validateMobile('415 555 2671', 'US')), null);
eq('US number under IN', code(v.validateMobile('4155552671', 'IN')), 'mobileInvalid');
eq('intl number ignores country', code(v.validateMobile('+14155552671', 'IN')), null);
eq('+91 with dashes ok', code(v.validateMobile('+91 98765-43210', 'IN')), null);
// mobile: input cleanup
eq('sanitize strips junk', v.sanitizePhoneInput('98a-76 5', 'IN'), { country: 'IN', digits: '98765' });
eq('sanitize caps length', v.sanitizePhoneInput('1'.repeat(20), 'IN').digits.length, 15);
eq('sanitize pasted intl', v.sanitizePhoneInput('+1 415 555 2671', 'IN'), { country: 'US', digits: '4155552671' });
eq('sanitize partial plus keeps country', v.sanitizePhoneInput('+9', 'IN'), { country: 'IN', digits: '9' });
// mobile: what the server receives
eq('server IN national', v.toServerMobile('98765 43210', 'IN'), '9876543210');
eq('server IN pasted +91', v.toServerMobile('+91 98765 43210', 'IN'), '9876543210');
eq('server US e164', v.toServerMobile('(415) 555-2671', 'US'), '+14155552671');
eq('server UK trunk zero', v.toServerMobile('07911 123456', 'GB'), '+447911123456');
// optional email
eq('email empty ok', code(v.validateOptionalEmail('')), null);
eq('email blank ok', code(v.validateOptionalEmail('   ')), null);
eq('email ok', code(v.validateOptionalEmail('a@b.co')), null);
eq('email trimmed ok', code(v.validateOptionalEmail(' a@b.co ')), null);
eq('email bad', code(v.validateOptionalEmail('a@b')), 'emailInvalid');
eq('email no at', code(v.validateOptionalEmail('plain')), 'emailInvalid');
// name
eq('name ok', code(v.validateName('Rahul Verma')), null);
eq('name unicode ok', code(v.validateName('राहुल वर्मा')), null);
eq('name apostrophe ok', code(v.validateName("D'Souza-Rao")), null);
eq('name short', code(v.validateName('R')), 'nameTooShort');
eq('name digits', code(v.validateName('R2D2')), 'nameInvalid');
eq('name empty', code(v.validateName('')), 'required');
eq('name long', code(v.validateName('a'.repeat(61))), 'tooLong');
// dob
const now = new Date(2026, 8, 20);
eq('dob empty ok', code(v.validateDateOfBirth('', now)), null);
eq('dob ok', code(v.validateDateOfBirth('2021-06-15', now)), null);
eq('dob partial', code(v.validateDateOfBirth('2021-06', now)), 'dateFormat');
eq('dob feb 31', code(v.validateDateOfBirth('2021-02-31', now)), 'dateInvalid');
eq('dob future', code(v.validateDateOfBirth('2027-01-01', now)), 'dateFuture');
eq('dob old', code(v.validateDateOfBirth('1970-01-01', now)), 'dateTooOld');
eq('dob leap ok', code(v.validateDateOfBirth('2020-02-29', now)), null);
eq('dob non-leap', code(v.validateDateOfBirth('2021-02-29', now)), 'dateInvalid');
eq('mask 1', v.formatDateInput('2021'), '2021');
eq('mask 2', v.formatDateInput('202106'), '2021-06');
eq('mask 3', v.formatDateInput('20210615'), '2021-06-15');
eq('mask strips', v.formatDateInput('2021-06-15xx99'), '2021-06-15');
// weight
eq('weight empty ok', code(v.validateWeight('')), null);
eq('weight ok', code(v.validateWeight('12.5')), null);
eq('weight zero', code(v.validateWeight('0')), 'weightInvalid');
eq('weight big', code(v.validateWeight('250')), 'weightInvalid');
eq('weight text', code(v.validateWeight('abc')), 'weightInvalid');
eq('weight 3dp', code(v.validateWeight('1.234')), 'weightInvalid');
eq('weight negative', code(v.validateWeight('-3')), 'weightInvalid');
// pincode / text
eq('pin ok', code(v.validatePincode('560034')), null);
eq('pin empty ok', code(v.validatePincode('')), null);
eq('pin short', code(v.validatePincode('5600')), 'pincodeInvalid');
eq('pin letters', code(v.validatePincode('56003a')), 'pincodeInvalid');
eq('req text', code(v.validateRequiredText(5)('')), 'required');
eq('req text long', code(v.validateRequiredText(5)('abcdefg')), 'tooLong');
eq('opt text ok', code(v.validateOptionalText(5)('')), null);
// files
const MB = 1024 * 1024;
eq('file required', code(v.validateFile(null)), 'fileRequired');
eq('pdf ok', code(v.validateFile({ mimeType: 'application/pdf', size: 2 * MB })), null);
eq('jpeg ok (case-insensitive)', code(v.validateFile({ mimeType: 'IMAGE/JPEG', size: 100 })), null);
eq('heic ok', code(v.validateFile({ mimeType: 'image/heic', size: 100 })), null);
eq('unknown size ok', code(v.validateFile({ mimeType: 'image/png', size: null })), null);
eq('exactly 10 MB ok', code(v.validateFile({ mimeType: 'application/pdf', size: 10 * MB })), null);
eq('over 10 MB rejected', code(v.validateFile({ mimeType: 'application/pdf', size: 10 * MB + 1 })), 'fileTooLarge');
eq('text file rejected', code(v.validateFile({ mimeType: 'text/plain', size: 10 })), 'fileType');
eq('zip rejected', code(v.validateFile({ mimeType: 'application/zip', size: 10 })), 'fileType');
eq('file size 500 B', v.formatFileSize(500), '500 B');
eq('file size KB', v.formatFileSize(2048), '2 KB');
eq('file size MB', v.formatFileSize(3 * MB), '3.0 MB');
// codes
eq('optional code empty ok', code(v.validateCode(true)('')), null);
eq('required code empty', code(v.validateCode(false)('  ')), 'required');
eq('code ok', code(v.validateCode(false)('WELCOME10')), null);
eq('code with space rejected', code(v.validateCode(false)('WEL COME')), 'codeInvalid');
eq('code with symbol rejected', code(v.validateCode(false)('CADO-10')), 'codeInvalid');
eq('too-short code rejected', code(v.validateCode(true)('AB')), 'codeInvalid');
// messages
eq('message ok', code(v.validateMessage(10, 500)('This is long enough')), null);
eq('message too short', code(v.validateMessage(10, 500)('short')), 'tooShort');
eq('message too long', code(v.validateMessage(2, 5)('abcdefg')), 'tooLong');
// otp
eq('otp ok', code(v.validateOtp('123456')), null);
eq('otp with leading zeros ok', code(v.validateOtp('000123')), null);
eq('otp empty', code(v.validateOtp('')), 'required');
eq('otp too short', code(v.validateOtp('12345')), 'otpInvalid');
eq('otp too long', code(v.validateOtp('1234567')), 'otpInvalid');
eq('otp letters', code(v.validateOtp('12a456')), 'otpInvalid');
eq('otp trimmed', code(v.validateOtp(' 123456 ')), null);
console.log(`client validation: ${pass} passed, ${fail} failed`);
