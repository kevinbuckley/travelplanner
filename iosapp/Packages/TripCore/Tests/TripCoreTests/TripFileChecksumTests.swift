import Foundation
import Testing

@testable import TripCore

@Suite("TripFileChecksum Tests")
struct TripFileChecksumTests {

    // Known SHA-256 values from external reference (openssl / Python hashlib):
    //   sha256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    //   sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

    @Test("Empty data produces known SHA-256")
    func emptyDataChecksum() {
        let result = TripFileChecksum.sha256(of: Data())
        #expect(result == "e3b0c44298fc1c149afbf4c8996fb924" +
                          "27ae41e4649b934ca495991b7852b855")
    }

    @Test("Known string produces correct SHA-256")
    func knownStringChecksum() {
        let result = TripFileChecksum.sha256(of: "hello")
        #expect(result == "2cf24dba5fb0a30e26e83b2ac5b9e29e" +
                          "1b161e5c1fa7425e73043362938b9824")
    }

    @Test("SHA-256 is deterministic for the same input")
    func deterministicOutput() {
        let data = Data("TripWit file content".utf8)
        let first  = TripFileChecksum.sha256(of: data)
        let second = TripFileChecksum.sha256(of: data)
        #expect(first == second)
    }

    @Test("Different data produces different checksums")
    func differentInputsDifferentHashes() {
        let a = TripFileChecksum.sha256(of: "Paris Trip")
        let b = TripFileChecksum.sha256(of: "Tokyo Trip")
        #expect(a != b)
    }

    @Test("Output is lowercase hex, 64 characters long")
    func outputFormat() {
        let result = TripFileChecksum.sha256(of: "TripWit")
        #expect(result.count == 64)
        #expect(result.allSatisfy { $0.isHexDigit })
        #expect(result == result.lowercased())
    }

    @Test("verify() returns true for matching checksum")
    func verifyMatch() {
        let data = Data("import this".utf8)
        let hex  = TripFileChecksum.sha256(of: data)
        #expect(TripFileChecksum.verify(data: data, expectedHex: hex))
    }

    @Test("verify() returns false for wrong checksum")
    func verifyMismatch() {
        let data  = Data("import this".utf8)
        let wrong = String(repeating: "0", count: 64)
        #expect(!TripFileChecksum.verify(data: data, expectedHex: wrong))
    }

    @Test("verify() is case-insensitive")
    func verifyCaseInsensitive() {
        let data  = Data("hello".utf8)
        let upper = TripFileChecksum.sha256(of: data).uppercased()
        #expect(TripFileChecksum.verify(data: data, expectedHex: upper))
    }

    @Test("File checksum round-trips correctly")
    func fileChecksumRoundTrip() throws {
        let content = Data("{ \"schemaVersion\": 1 }".utf8)
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("test-\(UUID()).tripwit")
        try content.write(to: url)
        defer { try? FileManager.default.removeItem(at: url) }

        let fromData = TripFileChecksum.sha256(of: content)
        let fromFile = TripFileChecksum.sha256(ofFileAt: url)
        #expect(fromData == fromFile)
    }

    @Test("sha256(ofFileAt:) returns nil for missing file")
    func missingFileReturnsNil() {
        let missing = URL(fileURLWithPath: "/tmp/does-not-exist-\(UUID()).tripwit")
        #expect(TripFileChecksum.sha256(ofFileAt: missing) == nil)
    }

    @Test("verify(fileAt:expectedHex:) returns false for missing file")
    func verifyMissingFileReturnsFalse() {
        let missing = URL(fileURLWithPath: "/tmp/no-such-file-\(UUID()).tripwit")
        #expect(!TripFileChecksum.verify(fileAt: missing, expectedHex: "abc"))
    }
}
