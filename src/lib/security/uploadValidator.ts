/**
 * Safe File and Audio Upload Validation
 * Enforces file size limits, MIME type verification, extension whitelisting,
 * filename sanitization, and binary magic-byte inspection.
 */

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMime?: string;
}

const ALLOWED_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
]);

const ALLOWED_AUDIO_EXTENSIONS = new Set(["webm", "wav", "ogg", "mp3", "m4a", "aac"]);

const MAX_AUDIO_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Sanitizes a user-provided filename to prevent path traversal and script execution
 */
export function sanitizeUploadFilename(filename: string): string {
  // Strip paths, null bytes, and unsafe characters
  const baseName = filename.replace(/^.*[\\/]/, "").replace(/\0/g, "");
  // Keep alphanumeric, dash, underscore, and dot
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized.slice(0, 100);
}

/**
 * Validates audio magic bytes against known headers
 */
export function validateAudioMagicBytes(buffer: Uint8Array): { valid: boolean; detectedType?: string } {
  if (buffer.length < 4) {
    return { valid: false };
  }

  // WebM / Matroska: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { valid: true, detectedType: "audio/webm" };
  }

  // RIFF WAV: 52 49 46 46 (RIFF) ... 57 41 56 45 (WAVE at offset 8)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x56 &&
    buffer[11] === 0x45
  ) {
    return { valid: true, detectedType: "audio/wav" };
  }

  // Ogg: 4F 67 67 53 (OggS)
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return { valid: true, detectedType: "audio/ogg" };
  }

  // MP3: ID3 tag (49 44 33) or MPEG sync frame (FF FB / FF FA / FF F3)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) ||
    (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
  ) {
    return { valid: true, detectedType: "audio/mpeg" };
  }

  // MP4 / M4A: offset 4 contains 'ftyp' (66 74 79 70)
  if (
    buffer.length >= 8 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return { valid: true, detectedType: "audio/mp4" };
  }

  // Fallback: accept if size is reasonable but magic bytes are not directly in strict list
  return { valid: false };
}

/**
 * Complete validation of uploaded audio buffer, mime type, and filename
 */
export function validateAudioUpload(
  buffer: Uint8Array,
  reportedMime: string,
  rawFilename: string
): UploadValidationResult {
  // 1. Size check
  if (buffer.length === 0) {
    return { valid: false, error: "Empty file received" };
  }

  if (buffer.length > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 8MB limit (received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  // 2. MIME check
  const normalizedMime = reportedMime.toLowerCase().split(";")[0].trim();
  if (!ALLOWED_AUDIO_MIMES.has(normalizedMime)) {
    return {
      valid: false,
      error: `Disallowed audio format: ${reportedMime}. Allowed formats: webm, wav, ogg, mp3, m4a.`,
    };
  }

  // 3. Filename & Extension check
  const sanitizedFilename = sanitizeUploadFilename(rawFilename);
  const ext = sanitizedFilename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_AUDIO_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Invalid file extension .${ext}. Allowed extensions: webm, wav, ogg, mp3, m4a.`,
    };
  }

  // 4. Magic Byte verification
  const magicCheck = validateAudioMagicBytes(buffer);
  if (!magicCheck.valid) {
    return {
      valid: false,
      error: "File signature does not match any valid audio format header (spoofing detected)",
    };
  }

  return {
    valid: true,
    sanitizedFilename,
    detectedMime: magicCheck.detectedType || normalizedMime,
  };
}
