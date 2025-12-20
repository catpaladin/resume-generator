import type {
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Project,
  BulletPoint,
} from "@/types/resume";
import type { Parser, ParseResult } from "./index";
import { PARSING_PATTERNS, SECTION_HEADERS } from "./index";
import { generateId } from "../validators/schemas";

export interface ParsedSection {
  title: string;
  content: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface ParsedExperienceBlock {
  raw: string;
  lines: string[];
  dateRange?: {
    start: string;
    end: string;
    raw: string;
    confidence: number;
  };
  companyPosition?: {
    company: string;
    position: string;
    format: string;
    confidence: number;
  };
  location?: {
    value: string;
    type: "city-state" | "city-country" | "remote" | "hybrid";
    confidence: number;
  };
  bulletPoints: BulletPoint[];
  confidence: number;
}

export abstract class BaseParser implements Parser {
  abstract getName(): string;
  abstract getSupportedExtensions(): string[];
  abstract canHandle(file: File): boolean;
  abstract parse(file: File): Promise<ParseResult>;

  protected stem(word: string): string {
    return word
      .toLowerCase()
      .replace(/ing$/, "")
      .replace(/ed$/, "")
      .replace(/s$/, "")
      .replace(/er$/, "")
      .replace(/ly$/, "");
  }

  protected tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  protected identifySections(text: string): ParsedSection[] {
    const lines = text.split("\n").map((line) => line.trim());
    const sections: ParsedSection[] = [];

    let currentSection: ParsedSection | null = null;
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 0) {
        if (currentSection) currentContent.push("");
        continue;
      }

      const sectionType = this.detectSectionHeader(line);

      if (sectionType) {
        if (currentSection) {
          currentSection.content = currentContent.join("\n").trim();
          currentSection.endIndex = i - 1;
          sections.push(currentSection);
        }

        currentSection = {
          title: sectionType,
          content: "",
          confidence: this.calculateSectionConfidence(line, sectionType),
          startIndex: i,
          endIndex: i,
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        // Content before any header is usually personal info
        if (!currentSection) {
          currentSection = {
            title: "personal",
            content: "",
            confidence: 0.8,
            startIndex: 0,
            endIndex: i,
          };
          currentContent = [line];
        } else {
          currentContent.push(line);
        }
      }
    }

    if (currentSection) {
      currentSection.content = currentContent.join("\n").trim();
      currentSection.endIndex = lines.length - 1;
      sections.push(currentSection);
    }

    return sections;
  }

  protected detectSectionHeader(line: string): string | null {
    const cleanLine = line
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "");
    const words = this.tokenize(cleanLine);

    if (words.length === 0) return null;

    for (const [sectionType, keywords] of Object.entries(SECTION_HEADERS)) {
      for (const keyword of keywords) {
        const stemmedKeyword = this.stem(keyword);
        const stemmedWords = words.map((w) => this.stem(w));

        // Exact match or contains as a full word
        if (stemmedWords.includes(stemmedKeyword)) {
          const isUpperCase = line === line.toUpperCase();
          const isShort = words.length <= 4;
          const hasSeparator = /[:\-\–\—]/.test(line);

          if (
            isShort &&
            (isUpperCase || hasSeparator || line.trim().length < 30)
          ) {
            return sectionType;
          }
        }
      }
    }

    return null;
  }

  protected calculateSectionConfidence(
    line: string,
    sectionType: string,
  ): number {
    let confidence = 0.5;
    const keywords =
      SECTION_HEADERS[sectionType as keyof typeof SECTION_HEADERS] || [];

    const lowerLine = line.toLowerCase();
    if (keywords.some((keyword) => lowerLine.includes(keyword.toLowerCase()))) {
      confidence += 0.3;
    }

    if (line.toUpperCase() === line && line.length > 3) confidence += 0.1;
    if (line.length < 40) confidence += 0.1;
    if (/[:\-\–\—]/.test(line)) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  protected async extractResumeData(
    plainText: string,
    sections: ParsedSection[],
  ): Promise<{
    personal?: PersonalInfo;
    experience?: Experience[];
    education?: Education[];
    skills?: Skill[];
    projects?: Project[];
  }> {
    const data: {
      personal?: PersonalInfo;
      experience?: Experience[];
      education?: Education[];
      skills?: Skill[];
      projects?: Project[];
    } = {};

    for (const section of sections) {
      switch (section.title) {
        case "personal":
          data.personal = this.extractPersonalInfo(section.content);
          break;
        case "experience":
          data.experience = this.extractExperience(section.content);
          break;
        case "education":
          data.education = this.extractEducation(section.content);
          break;
        case "skills":
          data.skills = this.extractSkills(section.content);
          break;
        case "projects":
          data.projects = this.extractProjects(section.content);
          break;
      }
    }

    if (!data.personal) {
      const firstLines = plainText.split("\n").slice(0, 10).join("\n");
      data.personal = this.extractPersonalInfo(firstLines);
    }

    return data;
  }

  protected extractPersonalInfo(content: string): PersonalInfo {
    const personal: PersonalInfo = {
      fullName: "",
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      summary: "",
    };

    const emailMatch = content.match(PARSING_PATTERNS.email);
    if (emailMatch) personal.email = emailMatch[0];

    const phoneMatch = content.match(PARSING_PATTERNS.phone);
    if (phoneMatch) personal.phone = phoneMatch[0];

    const linkedinMatch = content.match(PARSING_PATTERNS.linkedin);
    if (linkedinMatch) personal.linkedin = linkedinMatch[0];

    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length > 0) {
      // Name is usually the first non-empty line that isn't a header or contact info
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        const isHeader = this.detectSectionHeader(line) !== null;

        // Reset lastIndex for global regexes before test() or use match()
        const hasEmail = line.match(PARSING_PATTERNS.email);
        const hasPhone = line.match(PARSING_PATTERNS.phone);
        const hasUrl = line.match(PARSING_PATTERNS.website);

        if (
          !isHeader &&
          !hasEmail &&
          !hasPhone &&
          !hasUrl &&
          line.length > 2 &&
          line.length < 60
        ) {
          // Additional check: Does it look like a name? (At least 1 word, capitalized)
          const words = line.split(/\s+/);
          const isCapitalized = words.every((w) => /^[A-Z]/.test(w));
          if (words.length >= 1 && (isCapitalized || i === 0)) {
            personal.fullName = line;
            break;
          }
        }
      }
    }

    const locationPatterns = [
      PARSING_PATTERNS.location.cityState,
      PARSING_PATTERNS.location.cityCountry,
      /(?:^|\n)\s*([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:,\s*\d{5})?)\s*(?:\n|$)/m,
      /(?:Location|Address|Resident of):\s*([^\n|]+)/i,
    ];
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        personal.location = (match[1] || match[0]).trim();
        break;
      }
    }

    const summaryHeaders = [
      "Summary",
      "Objective",
      "Profile",
      "Personal Statement",
      "About Me",
    ];
    const summaryPatterns = [
      new RegExp(
        `(?:${summaryHeaders.join("|")}):?\\s*([^]*?)(?:\n\n|\n[A-Z][^a-z]{2,}|$)`,
        "i",
      ),
      /(?:^|\n)([A-Z][^]*?)(?:\n\n|\n[A-Z]{2,})/m,
    ];
    for (const pattern of summaryPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 30) {
        personal.summary = match[1].trim();
        break;
      }
    }

    return personal;
  }

  protected extractExperience(content: string): Experience[] {
    const experiences: Experience[] = [];
    const jobBlocks = this.splitExperienceBlocks(content);

    for (const blockText of jobBlocks) {
      const parsedBlock = this.parseExperienceBlockEnhanced(blockText);
      if (parsedBlock.confidence > 0.01) {
        const experience = this.convertParsedBlockToExperience(parsedBlock);
        if (experience && (experience.company || experience.position)) {
          experiences.push(experience);
        }
      }
    }

    return this.postProcessExperiences(experiences);
  }

  protected splitExperienceBlocks(content: string): string[] {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const blocks: string[] = [];
    let currentBlock: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isJobTitleLine = this.looksLikeJobTitle(line);
      const hasCompanyIndicators = line.match(
        PARSING_PATTERNS.company.suffixes,
      );
      const hasDate = this.lineContainsDate(line);
      const isLikelyJobLine = isJobTitleLine || hasCompanyIndicators;

      const nextLineHasDate =
        i + 1 < lines.length && this.lineContainsDate(lines[i + 1]);
      const nextLineIsLocation =
        i + 1 < lines.length &&
        (lines[i + 1].match(PARSING_PATTERNS.location.cityState) ||
          lines[i + 1].match(PARSING_PATTERNS.location.remote));

      const isNewExperienceStart =
        (isLikelyJobLine &&
          (nextLineHasDate || nextLineIsLocation || hasDate)) ||
        (hasDate && isLikelyJobLine) ||
        (line.includes(" at ") && isLikelyJobLine);

      // Don't split if the current block is very short and looks like it's just part of a header
      const shouldSplit =
        isNewExperienceStart &&
        (currentBlock.length > 2 ||
          this.blockLooksLikeExperience(currentBlock.join("\n")));

      if (shouldSplit && currentBlock.length > 0) {
        const blockText = currentBlock.join("\n");
        blocks.push(blockText);
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join("\n"));
    }

    return blocks;
  }

  protected parseExperienceBlockEnhanced(block: string): ParsedExperienceBlock {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsedBlock: ParsedExperienceBlock = {
      raw: block,
      lines,
      bulletPoints: [],
      confidence: 0,
    };

    parsedBlock.dateRange = this.extractDateRangeEnhanced(block);
    parsedBlock.companyPosition = this.extractCompanyPositionEnhanced(lines);
    parsedBlock.location = this.extractLocationEnhanced(block);
    parsedBlock.bulletPoints = this.extractBulletPointsEnhanced(block);
    parsedBlock.confidence = this.calculateBlockConfidence(parsedBlock);

    return parsedBlock;
  }

  protected extractCompanyPositionEnhanced(
    lines: string[],
  ): ParsedExperienceBlock["companyPosition"] {
    const nonDateLines = lines.filter((line) => {
      if (
        this.lineContainsDate(line) ||
        this.isHeaderLine(line) ||
        this.looksLikeBulletPoint(line)
      ) {
        return false;
      }
      // Only filter out if it's a location AND doesn't look like a job/company
      const isLocation =
        line.match(PARSING_PATTERNS.location.cityState) ||
        line.match(PARSING_PATTERNS.location.remote);
      const isJobOrCompany =
        this.looksLikeJobTitle(line) ||
        line.match(PARSING_PATTERNS.company.suffixes);

      if (isLocation && !isJobOrCompany) {
        return false;
      }
      return true;
    });

    if (nonDateLines.length === 0) return undefined;

    for (const line of nonDateLines) {
      const atMatch = line.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
      if (atMatch) {
        return {
          position: atMatch[1].trim(),
          company: atMatch[2].trim(),
          format: "position-at-company",
          confidence: 0.9,
        };
      }

      // Look for explicit separators
      const separators = PARSING_PATTERNS.company.separators;
      if (line.match(separators)) {
        const parts = line
          .split(separators)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        if (parts.length >= 2) {
          const firstHasSuffix = parts[0].match(
            PARSING_PATTERNS.company.suffixes,
          );
          const secondHasSuffix = parts[1].match(
            PARSING_PATTERNS.company.suffixes,
          );
          const firstIsTitle = this.looksMoreLikePosition(parts[0]);
          const secondIsTitle = this.looksMoreLikePosition(parts[1]);

          if (firstHasSuffix && !secondHasSuffix) {
            return {
              company: parts[0],
              position: parts[1],
              format: "sep",
              confidence: 0.9,
            };
          }
          if (secondHasSuffix && !firstHasSuffix) {
            return {
              company: parts[1],
              position: parts[0],
              format: "sep",
              confidence: 0.9,
            };
          }
          if (firstIsTitle && !secondIsTitle) {
            return {
              position: parts[0],
              company: parts[1],
              format: "sep",
              confidence: 0.85,
            };
          }
          if (secondIsTitle && !firstIsTitle) {
            return {
              position: parts[1],
              company: parts[0],
              format: "sep",
              confidence: 0.85,
            };
          }
          return {
            position: parts[0],
            company: parts[1],
            format: "sep",
            confidence: 0.7,
          };
        }
      }
    }

    if (nonDateLines.length >= 2) {
      const first = nonDateLines[0];
      const second = nonDateLines[1];

      const firstHasSuffix = first.match(PARSING_PATTERNS.company.suffixes);
      const secondIsTitle = this.looksMoreLikePosition(second);

      if (firstHasSuffix && secondIsTitle) {
        return {
          company: first,
          position: second,
          format: "multi",
          confidence: 0.85,
        };
      }
      if (this.looksMoreLikePosition(first)) {
        return {
          position: first,
          company: second,
          format: "multi",
          confidence: 0.8,
        };
      }
      return {
        company: first,
        position: second,
        format: "multi",
        confidence: 0.7,
      };
    }

    const line = nonDateLines[0];
    const hasSuffix = line.match(PARSING_PATTERNS.company.suffixes);
    if (hasSuffix) {
      return { company: line, position: "", format: "single", confidence: 0.6 };
    }
    return { position: line, company: "", format: "single", confidence: 0.5 };
  }

  protected extractBulletPointsEnhanced(block: string): BulletPoint[] {
    const bulletPoints: BulletPoint[] = [];
    const lines = block.split("\n").map((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || this.lineContainsDate(line) || this.isHeaderLine(line)) {
        continue;
      }

      const bulletText = this.extractBulletText(line);
      if (bulletText) {
        if (this.isValidBulletPoint(bulletText)) {
          bulletPoints.push({
            id: generateId(),
            text: bulletText,
          });
        }
      } else if (
        this.looksLikeAchievement(line) &&
        !this.looksLikeJobTitle(line) &&
        !this.lineContainsDate(line) &&
        line.length > 10
      ) {
        bulletPoints.push({
          id: generateId(),
          text: line,
        });
      }
    }

    return bulletPoints;
  }

  protected looksLikeJobTitle(line: string): boolean {
    const jobTitleIndicators = [
      /\b(?:at|@|with|for|in)\b/i,
      /\b(?:-|–|—|\||\u2022|•)\b/,
      /^\w+(?:\s+\w+){0,4}$/,
      /\b(?:engineer|developer|manager|analyst|specialist|coordinator|director|lead|senior|junior|intern|consultant|architect|designer|administrator|supervisor|executive|officer|representative|associate|assistant)\b/i,
      /\b(?:software|web|frontend|backend|full.?stack|data|product|project|marketing|sales|business|operations|technical|IT)\s+(?:engineer|developer|manager|lead|director)/i,
    ];

    const commonTitles = [
      /^(?:senior|junior|lead|principal|staff|associate|assistant|head|chief|vice president|vp)\s+/i,
      /\b(?:software|web|frontend|backend|full.?stack|data|product|project|devops|cloud|mobile|ui\/ux|ux\/ui)\s+(?:engineer|developer|manager|architect|designer)/i,
      /\b(?:marketing|sales|business|operations|human resources|hr|finance|accounting|legal)\s+(?:manager|specialist|coordinator|analyst|director)/i,
      /\b(?:ceo|cto|cfo|coo|cmo|vp|president|director|manager)\b/i,
    ];

    const companyIndicators = PARSING_PATTERNS.company.suffixes;
    const hasCompanyMarkers = line.match(companyIndicators);

    if (
      hasCompanyMarkers &&
      !jobTitleIndicators.some((pattern) => pattern.test(line))
    ) {
      return false;
    }

    return (
      line.length < 80 &&
      (jobTitleIndicators.some((pattern) => pattern.test(line)) ||
        commonTitles.some((pattern) => pattern.test(line))) &&
      !this.looksLikeAchievement(line)
    );
  }

  protected looksLikeBulletPoint(line: string): boolean {
    const bulletMarkers = /^[\s]*[•·▪▫◦‣⁃▸▹▶▷◆◇■□▲△►▻⟩〉]\s+/;
    const numberedList = /^[\s]*\d+[\.\)]\s+/;
    const letteredList = /^[\s]*[a-zA-Z][\.\)]\s+/;
    const dashBullet = /^[\s]*[-*+]\s+/;

    return (
      bulletMarkers.test(line) ||
      numberedList.test(line) ||
      letteredList.test(line) ||
      dashBullet.test(line)
    );
  }

  protected looksMoreLikePosition(line: string): boolean {
    const hasCompanySuffixes = line.match(PARSING_PATTERNS.company.suffixes);
    if (hasCompanySuffixes) return false;

    if (
      /\b(?:Solutions|Technologies|Systems|Corp|Corporation|Company|Inc|LLC|Ltd|Group|Enterprises)\b/i.test(
        line,
      )
    ) {
      return false;
    }

    const positionIndicators = [
      /\b(?:engineer|developer|manager|analyst|specialist|coordinator|director|lead|senior|junior|intern|consultant|architect|designer|administrator|supervisor|executive|officer|representative|associate|assistant)\b/i,
      /^(?:senior|junior|lead|principal|staff|associate|assistant|head|chief|vice president|vp)\s+/i,
      /\b(?:software|web|frontend|backend|full.?stack|data|product|project|marketing|sales|business|operations|technical|IT|devops|cloud|mobile|ui\/ux|ux\/ui)\s+(?:engineer|developer|manager|architect|designer|lead|director)/i,
      /\b(?:ceo|cto|cfo|coo|cmo|vp|president)\b/i,
    ];

    const hasPositionIndicators = positionIndicators.some((pattern) =>
      pattern.test(line),
    );

    const hasAtIndicator = /\b(?:at|@)\s+/.test(line);
    if (hasAtIndicator) {
      const beforeAt = line.split(/\b(?:at|@)\s+/)[0];
      return positionIndicators.some((pattern) => pattern.test(beforeAt));
    }

    if (hasPositionIndicators) return true;

    return line.length < 50;
  }

  protected lineContainsDate(line: string): boolean {
    return !!(
      line.match(PARSING_PATTERNS.dates.monthYear) ||
      line.match(PARSING_PATTERNS.dates.yearRange) ||
      line.match(PARSING_PATTERNS.dates.monthYearRange) ||
      line.match(PARSING_PATTERNS.dates.quarterYear) ||
      line.match(PARSING_PATTERNS.dates.mmYyyy) ||
      line.match(PARSING_PATTERNS.dates.seasons) ||
      line.match(PARSING_PATTERNS.dates.fullDate)
    );
  }

  protected blockLooksLikeExperience(block: string): boolean {
    const hasDate = this.lineContainsDate(block);
    const hasJobTerms =
      /\b(?:engineer|developer|manager|analyst|specialist|coordinator|director|lead|company|inc|llc|corp|at|software|senior|junior)\b/i.test(
        block,
      );
    const hasBulletPoints = /^[\s]*[•▪\-→○\*\+]\s+/m.test(block);
    const hasAchievementWords =
      /\b(?:developed|managed|led|created|implemented|improved|achieved|responsible|worked|collaborated|built|designed)\b/i.test(
        block,
      );

    const lines = block.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length < 2) return false;

    const looksLikePersonalInfo =
      /^[A-Z][a-z]+\s+[A-Z][a-z]+\s*$/.test(block.trim()) ||
      /^\w+@\w+\.\w+\s*$/.test(block.trim()) ||
      /^EXPERIENCE\s*$/i.test(block.trim());

    if (looksLikePersonalInfo) return false;

    const indicators = [
      hasDate,
      hasJobTerms,
      hasBulletPoints,
      hasAchievementWords,
    ];
    const indicatorCount = indicators.filter(Boolean).length;

    return indicatorCount >= 1;
  }

  protected extractDateRangeEnhanced(
    block: string,
  ): ParsedExperienceBlock["dateRange"] {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const line of lines) {
      const monthYearRange = line.match(
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s*-\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i,
      );
      if (monthYearRange) {
        return {
          start: `${monthYearRange[1]} ${monthYearRange[2]}`,
          end: `${monthYearRange[3]} ${monthYearRange[4]}`,
          raw: monthYearRange[0],
          confidence: 0.9,
        };
      }

      const quarterRange = line.match(
        /\b(Q[1-4])\s+(\d{4})\s*-\s*(Q[1-4])\s+(\d{4})\b/i,
      );
      if (quarterRange) {
        return {
          start: `${quarterRange[1]} ${quarterRange[2]}`,
          end: `${quarterRange[3]} ${quarterRange[4]}`,
          raw: quarterRange[0],
          confidence: 0.8,
        };
      }

      const presentRange = line.match(
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s*-\s*(Present|Current|Ongoing|Now)\b/i,
      );
      if (presentRange) {
        return {
          start: `${presentRange[1]} ${presentRange[2]}`,
          end: presentRange[3],
          raw: presentRange[0],
          confidence: 0.9,
        };
      }

      const internationalRange = line.match(
        /\b(\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{4})\b/,
      );
      if (internationalRange) {
        return {
          start: internationalRange[1],
          end: internationalRange[2],
          raw: internationalRange[0],
          confidence: 0.6,
        };
      }

      const shortMonthRange = line.match(
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i,
      );
      if (shortMonthRange) {
        return {
          start: `${shortMonthRange[1]} ${shortMonthRange[2]}`,
          end: `${shortMonthRange[3]} ${shortMonthRange[4]}`,
          raw: shortMonthRange[0],
          confidence: 0.9,
        };
      }
    }

    const normalizedBlock = block.replace(/\s+/g, " ").trim();
    const allDates = [];
    const monthYearMatches = normalizedBlock.matchAll(
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    );
    for (const match of monthYearMatches) {
      allDates.push(match[0]);
    }

    const quarterMatches = normalizedBlock.matchAll(/\bQ[1-4]\s+\d{4}\b/gi);
    for (const match of quarterMatches) {
      allDates.push(match[0]);
    }

    if (allDates.length >= 2) {
      return {
        start: allDates[0],
        end: allDates[1],
        raw: `${allDates[0]} - ${allDates[1]}`,
        confidence: 0.5,
      };
    }

    return undefined;
  }

  protected extractLocationEnhanced(
    block: string,
  ): ParsedExperienceBlock["location"] {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const line of lines) {
      if (this.lineContainsDate(line) || this.looksLikeBulletPoint(line)) {
        continue;
      }

      if (
        this.looksLikeJobTitle(line) &&
        !line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}$/)
      ) {
        continue;
      }

      if (
        line.match(PARSING_PATTERNS.company.suffixes) &&
        !line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}$/)
      ) {
        continue;
      }

      if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}$/)) {
        return {
          value: line.trim(),
          type: "city-state" as const,
          confidence: 0.95,
        };
      }

      if (
        line.match(
          /^(?:Remote|Virtual|Home|WFH|Work\s+from\s+home|Distributed|Telecommute)$/i,
        )
      ) {
        return {
          value: line.trim(),
          type: "remote" as const,
          confidence: 0.9,
        };
      }
    }

    const locationPatterns = [
      {
        pattern: PARSING_PATTERNS.location.cityState,
        type: "city-state" as const,
        confidence: 0.8,
      },
      {
        pattern: PARSING_PATTERNS.location.remote,
        type: "remote" as const,
        confidence: 0.7,
      },
      {
        pattern: PARSING_PATTERNS.location.cityCountry,
        type: "city-country" as const,
        confidence: 0.6,
      },
    ];

    for (const { pattern, type, confidence } of locationPatterns) {
      const match = block.match(pattern);
      if (match) {
        return {
          value: match[0].trim(),
          type,
          confidence,
        };
      }
    }

    return undefined;
  }

  protected extractLocationFromLine(line: string): string | null {
    const cityStateMatch = line.match(PARSING_PATTERNS.location.cityState);
    if (cityStateMatch) return cityStateMatch[0];

    const remoteMatch = line.match(PARSING_PATTERNS.location.remote);
    if (remoteMatch) return remoteMatch[0];

    return null;
  }

  protected isHeaderLine(line: string): boolean {
    if (this.looksLikeBulletPoint(line)) return false;
    const cleanLine = line.trim();
    if (cleanLine.length === 0) return false;

    return (
      cleanLine.length < 50 &&
      !this.lineContainsDate(cleanLine) &&
      (cleanLine.toUpperCase() === cleanLine ||
        this.detectSectionHeader(cleanLine) !== null)
    );
  }

  protected extractBulletText(line: string): string | null {
    const bulletPatterns = [
      /^[\s]*[•▪\-→○\*\+·▫◦‣⁃▸▹▶▷◆◇■□▲△►▻⟩〉]\s*(.+)$/,
      /^[\s]*\d+[.\)]\s+(.+)$/,
      /^[\s]*[a-zA-Z][.\)]\s+(.+)$/,
    ];

    for (const pattern of bulletPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  protected isValidBulletPoint(text: string): boolean {
    return (
      text.length >= 5 &&
      text.length <= 500 &&
      !this.lineContainsDate(text) &&
      !/^(?:location|address|phone|email|contact)/i.test(text) &&
      !/^(?:Software Engineer at|Developer at|Manager at)/i.test(text)
    );
  }

  protected calculateBlockConfidence(block: ParsedExperienceBlock): number {
    let confidence = 0;
    let factors = 0;

    if (block.dateRange) {
      confidence += block.dateRange.confidence * 0.3;
      factors += 0.3;
    }

    if (block.companyPosition) {
      confidence += block.companyPosition.confidence * 0.4;
      factors += 0.4;
    }

    if (block.location) {
      confidence += block.location.confidence * 0.1;
      factors += 0.1;
    }

    if (block.bulletPoints.length > 0) {
      confidence += Math.min(block.bulletPoints.length * 0.1, 0.3);
      factors += 0.3;
    }

    const hasAnyContent =
      block.companyPosition ||
      block.dateRange ||
      block.location ||
      block.bulletPoints.length > 0;
    const minConfidence = hasAnyContent ? 0.1 : 0;

    return factors > 0
      ? Math.max(confidence / factors, minConfidence)
      : minConfidence;
  }

  protected convertParsedBlockToExperience(
    block: ParsedExperienceBlock,
  ): Experience {
    const experience: Experience = {
      id: generateId(),
      company: block.companyPosition?.company || "",
      position: block.companyPosition?.position || "",
      location: block.location?.value || "",
      startDate: block.dateRange?.start || "",
      endDate: block.dateRange?.end || "",
      bulletPoints: block.bulletPoints,
    };

    if (block.dateRange?.end) {
      const endDate = block.dateRange.end.toLowerCase();
      if (
        endDate.includes("present") ||
        endDate.includes("current") ||
        endDate.includes("ongoing") ||
        endDate.includes("now")
      ) {
        experience.isCurrent = true;
      }
    }

    return experience;
  }

  protected postProcessExperiences(experiences: Experience[]): Experience[] {
    experiences.sort((a, b) => {
      const aYear = this.extractYearFromDate(a.startDate);
      const bYear = this.extractYearFromDate(b.startDate);
      return bYear - aYear;
    });

    return experiences
      .map((exp) => ({
        ...exp,
        company: this.cleanCompanyName(exp.company),
        position: this.cleanPositionTitle(exp.position),
        location: this.cleanLocation(exp.location),
      }))
      .filter((exp) => exp.company || exp.position);
  }

  protected extractYearFromDate(dateStr: string): number {
    const yearMatch = dateStr.match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0], 10) : 0;
  }

  protected cleanCompanyName(company: string): string {
    return company
      .replace(/^\s*[-–—|•]\s*/, "")
      .replace(/\s*[-–—|•]\s*$/, "")
      .trim();
  }

  protected cleanPositionTitle(position: string): string {
    return position
      .replace(/^\s*[-–—|•]\s*/, "")
      .replace(/\s*[-–—|•]\s*$/, "")
      .trim();
  }

  protected cleanLocation(location: string): string {
    return location
      .replace(/^\s*[-–—|•()\[\]]\s*/, "")
      .replace(/\s*[-–—|•()\[\]]\s*$/, "")
      .trim();
  }

  protected looksLikeAchievement(line: string): boolean {
    const achievementIndicators = [
      /\b(?:achieved|accomplished|improved|increased|decreased|reduced|developed|created|built|designed|implemented|managed|led|coordinated|optimized|streamlined)\b/i,
      /\b(?:responsible for|worked on|collaborated|contributed|delivered|executed|maintained|supported)\b/i,
      /\b\d+%\b/,
      /\$[1-9]\d{0,2}(?:,\d{3})*(?:\.\d{2})?/,
      /\b[1-9]\d{0,2}[kKmM]\+?\b/,
    ];

    return (
      line.length > 15 &&
      line.length < 200 &&
      achievementIndicators.some((pattern) => pattern.test(line))
    );
  }

  protected extractEducation(content: string): Education[] {
    const educationEntries: Education[] = [];
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentEntry: Education | null = null;

    for (const line of lines) {
      const degreePatterns = [
        /\b(?:Bachelor|Master|PhD|B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|MBA|PhD)\b/i,
        /\b(?:Associate|Certificate|Diploma|Graduate|Doctorate)\b/i,
        /\b(?:BEng|MEng|BSc|MSc|LLB|LLM)\b/i,
      ];

      const hasDegreeLike = degreePatterns.some((pattern) =>
        pattern.test(line),
      );
      const hasUniversity =
        /\b(?:University|College|Institute|School|Academy|Polytechnic)\b/i.test(
          line,
        );
      const hasYear = /\b\d{4}\b/.test(line);

      // New entry if line has degree or university and we don't have one or current one already has both
      if (hasDegreeLike || hasUniversity || (hasYear && !currentEntry)) {
        if (currentEntry && (currentEntry.school || currentEntry.degree)) {
          educationEntries.push(currentEntry);
        }

        currentEntry = {
          id: generateId(),
          school: "",
          degree: "",
          graduationYear: "",
        };

        const yearMatch = line.match(/\b(\d{4})\b/);
        if (yearMatch) currentEntry.graduationYear = yearMatch[1];

        // Try to split degree and school within the same line
        const separators = /[,||\-\–\—\t]/;
        if (line.match(separators)) {
          const parts = line
            .split(separators)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
          for (const part of parts) {
            const partHasDegree = degreePatterns.some((p) => p.test(part));
            if (partHasDegree) {
              currentEntry.degree = part;
            } else if (
              /\b(?:University|College|Institute|School)\b/i.test(part) ||
              part.length > 5
            ) {
              if (!currentEntry.school) currentEntry.school = part;
            }
          }
        } else {
          if (hasDegreeLike)
            currentEntry.degree = line.replace(/\b\d{4}\b/, "").trim();
          else if (hasUniversity)
            currentEntry.school = line.replace(/\b\d{4}\b/, "").trim();
        }
      } else if (currentEntry) {
        if (!currentEntry.school) currentEntry.school = line;
        else if (!currentEntry.degree) currentEntry.degree = line;
      }
    }

    if (currentEntry && (currentEntry.school || currentEntry.degree)) {
      educationEntries.push(currentEntry);
    }

    return educationEntries.filter(
      (entry) => entry.degree || entry.school,
    ) as Education[];
  }

  protected extractSkills(content: string): Skill[] {
    const skills: Skill[] = [];
    const skillTexts = content
      .split(/[,;|\n•\-\*]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const skillText of skillTexts) {
      if (skillText.length > 50) continue;
      if (this.looksLikeSkill(skillText)) {
        skills.push({
          id: generateId(),
          name: skillText,
          category: this.categorizeSkill(skillText),
        });
      }
    }

    return skills;
  }

  protected looksLikeSkill(text: string): boolean {
    const excludePatterns = [
      /\b(?:years?|experience|proficient|familiar|knowledge)\b/i,
      /^(?:and|or|the|a|an)\b/i,
      /\d+\s*years?/i,
    ];

    if (excludePatterns.some((pattern) => pattern.test(text))) return false;

    const skillPatterns = [
      PARSING_PATTERNS.skills.programming,
      PARSING_PATTERNS.skills.tools,
      /\b(?:HTML|CSS|SQL|XML|JSON|REST|API|Git|Linux|Windows|macOS)\b/i,
    ];

    return (
      skillPatterns.some((pattern) => !!text.match(pattern)) ||
      (text.length >= 2 && text.length <= 30 && !/\s{2,}/.test(text))
    );
  }

  protected categorizeSkill(skill: string): string {
    if (skill.match(PARSING_PATTERNS.skills.programming)) return "Programming";
    if (skill.match(PARSING_PATTERNS.skills.tools)) return "Tools";
    if (/\b(?:HTML|CSS|SQL|XML|JSON|REST|API)\b/i.test(skill))
      return "Technical";
    return "General";
  }

  protected extractProjects(content: string): Project[] {
    const projects: Project[] = [];
    const projectBlocks = content
      .split(/\n\s*\n/)
      .filter((block) => block.trim().length > 0);

    for (const block of projectBlocks) {
      const project = this.parseProjectBlock(block);
      if (project && project.name) projects.push(project);
    }

    return projects;
  }

  protected parseProjectBlock(block: string): Project | null {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return null;

    const project: Project = {
      id: generateId(),
      name: "",
      description: "",
      url: "",
    };

    project.name = lines[0];
    const urlMatch = block.match(PARSING_PATTERNS.website);
    if (urlMatch) project.url = urlMatch[0];

    const descriptionLines = lines
      .slice(1)
      .filter((line) => !line.match(PARSING_PATTERNS.website));
    project.description = descriptionLines.join(" ");

    return project;
  }

  protected calculateOverallConfidence(
    sections: ParsedSection[],
    extractedData: Record<string, any>,
  ): number {
    let totalConfidence = 0.3;
    const sectionWeights = {
      personal: 0.3,
      experience: 0.3,
      education: 0.2,
      skills: 0.1,
      projects: 0.1,
    };

    for (const section of sections) {
      const weight =
        sectionWeights[section.title as keyof typeof sectionWeights] || 0.1;
      totalConfidence += section.confidence * weight * 0.3;
    }

    const personal = extractedData.personal as PersonalInfo | undefined;
    const experience = extractedData.experience as Experience[] | undefined;
    const education = extractedData.education as Education[] | undefined;

    let dataCompleteness = 0;
    const maxPossiblePoints = 5;

    if (personal?.email) dataCompleteness += 1;
    if (personal?.phone) dataCompleteness += 0.5;
    if (personal?.fullName) dataCompleteness += 0.5;
    if (experience && experience.length > 0) {
      dataCompleteness += 2;
      const wellStructuredExp = experience.filter(
        (exp) => exp.company && exp.position && exp.startDate,
      );
      if (wellStructuredExp.length > 0) {
        dataCompleteness += wellStructuredExp.length * 0.2;
      }
    }
    if (education && education.length > 0) dataCompleteness += 1;

    const completenessRatio = dataCompleteness / maxPossiblePoints;
    totalConfidence += completenessRatio * 0.4;

    return Math.min(totalConfidence, 1.0);
  }

  protected generateWarnings(
    extractedData: Record<string, any>,
    sections: ParsedSection[],
  ): string[] {
    const warnings: string[] = [];
    const personal = extractedData.personal as PersonalInfo | undefined;
    const experience = extractedData.experience as Experience[] | undefined;

    if (!personal?.email) {
      warnings.push(
        "Email address not found - please verify contact information",
      );
    }
    if (!personal?.fullName) {
      warnings.push(
        "Full name not detected - please check personal information",
      );
    }
    if (!experience || experience.length === 0) {
      warnings.push(
        "No work experience found - please review experience section",
      );
    }

    const lowConfidenceSections = sections.filter((s) => s.confidence < 0.6);
    if (lowConfidenceSections.length > 0) {
      warnings.push(
        `Some sections may need manual review: ${lowConfidenceSections.map((s) => s.title).join(", ")}`,
      );
    }

    return warnings;
  }
}
