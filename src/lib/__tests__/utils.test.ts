import {
  cn,
  formatPhoneNumber,
  getDomainFromUrl,
  isDefined,
  isEmptyString,
  getInitials,
  debounce,
} from "../utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("class1", "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle conditional class names", () => {
      const result = cn("class1", undefined, null, false, "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format a 10-digit phone number correctly", () => {
      const result = formatPhoneNumber("1234567890");
      expect(result).toBe("123-456-7890");
    });

    it("should format a phone number with existing formatting", () => {
      const result = formatPhoneNumber("(123) 456-7890");
      expect(result).toBe("123-456-7890");
    });

    it("should return the original string if it cannot be formatted", () => {
      const result = formatPhoneNumber("123");
      expect(result).toBe("123");
    });
  });

  describe("getDomainFromUrl", () => {
    it("should extract domain from a valid URL", () => {
      const result = getDomainFromUrl("https://www.example.com/path");
      expect(result).toBe("example.com");
    });

    it("should handle URLs without www", () => {
      const result = getDomainFromUrl("https://example.com/path");
      expect(result).toBe("example.com");
    });

    it("should return the original string for invalid URLs", () => {
      const result = getDomainFromUrl("invalid-url");
      expect(result).toBe("invalid-url");
    });
  });

  describe("isDefined", () => {
    it("should return true for defined values", () => {
      expect(isDefined("test")).toBe(true);
      expect(isDefined(123)).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it("should return false for null or undefined values", () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe("isEmptyString", () => {
    it("should return true for empty strings or whitespace only", () => {
      expect(isEmptyString("")).toBe(true);
      expect(isEmptyString(" ")).toBe(true);
      expect(isEmptyString("   ")).toBe(true);
    });

    it("should return false for strings with content", () => {
      expect(isEmptyString("test")).toBe(false);
      expect(isEmptyString(" test ")).toBe(false);
    });
  });

  describe("getInitials", () => {
    it("should generate initials from a name", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Mary Jane Watson")).toBe("MJW");
      expect(getInitials("single")).toBe("S");
    });

    it("should handle empty names", () => {
      expect(getInitials("")).toBe("");
    });
  });

  describe("debounce", () => {
    jest.useFakeTimers();

    it("should debounce function calls", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should call the function with correct arguments", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc("arg1", "arg2");

      jest.advanceTimersByTime(1000);

      expect(func).toHaveBeenCalledWith("arg1", "arg2");
    });
  });
});
