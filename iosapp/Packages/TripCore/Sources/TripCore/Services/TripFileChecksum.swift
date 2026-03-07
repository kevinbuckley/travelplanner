import CryptoKit
import Foundation

/// Computes and verifies SHA-256 checksums for .tripwit file data.
///
/// Used to detect corruption or tampering when importing shared trip files.
public enum TripFileChecksum {

    // MARK: - Core

    /// Returns the lowercase hex-encoded SHA-256 digest of `data`.
    public static func sha256(of data: Data) -> String {
        let digest = SHA256.hash(data: data)
        return digest.map { String(format: "%02x", $0) }.joined()
    }

    /// Returns the SHA-256 digest of the UTF-8 encoding of `string`.
    public static func sha256(of string: String) -> String {
        sha256(of: Data(string.utf8))
    }

    // MARK: - File

    /// Reads `url` and returns its SHA-256 digest, or `nil` if the file cannot be read.
    public static func sha256(ofFileAt url: URL) -> String? {
        guard let data = try? Data(contentsOf: url) else { return nil }
        return sha256(of: data)
    }

    // MARK: - Verification

    /// Returns `true` when the SHA-256 of `data` matches `expectedHex` (case-insensitive).
    public static func verify(data: Data, expectedHex: String) -> Bool {
        sha256(of: data).lowercased() == expectedHex.lowercased()
    }

    /// Returns `true` when the SHA-256 of the file at `url` matches `expectedHex`.
    public static func verify(fileAt url: URL, expectedHex: String) -> Bool {
        guard let actual = sha256(ofFileAt: url) else { return false }
        return actual.lowercased() == expectedHex.lowercased()
    }
}
