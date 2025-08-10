import type { AISettings, AIEnhancementRequest } from "@/types/resume";
import { getApiKey } from "./secureStorage";

export class AIService {
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
  }

  async enhanceBulletPoint(request: AIEnhancementRequest): Promise<string> {
    const enhancedRequest = {
      ...request,
      jobDescription: request.jobDescription || this.settings.jobDescription
    };
    const prompt = this.buildEnhancementPrompt(enhancedRequest);
    
    try {
      const response = await this.makeAPICall(prompt);
      return response.trim();
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      throw new Error("Failed to enhance bullet point. Please check your API key and try again.");
    }
  }

  async tailorToJobDescription(
    bulletPoints: string[],
    jobDescription: string,
    context: { company: string; position: string }
  ): Promise<string[]> {
    const finalJobDescription = jobDescription || this.settings.jobDescription || "";
    const prompt = this.buildTailoringPrompt(bulletPoints, finalJobDescription, context);
    
    try {
      const response = await this.makeAPICall(prompt);
      return this.parseBulletPointsFromResponse(response);
    } catch (error) {
      console.error("AI Tailoring Error:", error);
      throw new Error("Failed to tailor achievements. Please check your API key and try again.");
    }
  }

  async summarizeAndEnhance(
    originalText: string,
    context: { company: string; position: string },
    targetLength: "concise" | "detailed" = "concise",
    existingBulletPoints: string[] = []
  ): Promise<string> {
    const prompt = this.buildSummarizationPrompt(originalText, context, targetLength, existingBulletPoints);
    
    try {
      const response = await this.makeAPICall(prompt);
      return this.extractQuotedContent(response.trim());
    } catch (error) {
      console.error("AI Summarization Error:", error);
      throw new Error("Failed to summarize achievement. Please check your API key and try again.");
    }
  }

  private buildEnhancementPrompt(request: AIEnhancementRequest): string {
    return `You are a professional resume writer. Enhance this achievement bullet point with the following guidelines:

ORIGINAL: "${request.originalText}"

CONTEXT:
- Company: ${request.context.company}
- Position: ${request.context.position}
${request.jobDescription ? `- Job Description: ${request.jobDescription}` : ""}

REQUIREMENTS:
- Start with diverse, strong action verbs (avoid overusing: developed, managed, led, created)
- Vary sentence structure and phrasing across achievements
- Only include metrics explicitly mentioned in original text - DO NOT fabricate numbers
- Show clear impact using provided information
- Keep concise (1-2 lines maximum)
- Stay truthful to original content
- Use professional, impactful language

RESPONSE FORMAT:
Provide ONLY the enhanced text enclosed in double quotes. No explanations, rationale, or additional text.

"enhanced achievement text goes here"`;
  }

  private buildTailoringPrompt(
    bulletPoints: string[],
    jobDescription: string,
    context: { company: string; position: string }
  ): string {
    return `You are a professional resume writer. Please tailor these bullet points to match the job description while maintaining truthfulness:

Current bullet points:
${bulletPoints.map((point, index) => `${index + 1}. ${point}`).join("\n")}

Job Description:
${jobDescription}

Context:
- Company: ${context.company}
- Position: ${context.position}

Guidelines:
- Rewrite bullet points to align with job requirements
- Use keywords from the job description naturally
- Emphasize relevant skills and achievements
- Maintain the same number of bullet points
- Keep achievements truthful but optimized
- Start each with strong action verbs

Tailored bullet points:`;
  }

  private buildSummarizationPrompt(
    originalText: string,
    context: { company: string; position: string },
    targetLength: "concise" | "detailed",
    existingBulletPoints: string[] = []
  ): string {
    const lengthGuidance = targetLength === "concise" 
      ? "Keep it to 1 line maximum, very concise"
      : "Can be 1-2 lines, more detailed but still impactful";
    
    const jobDescriptionContext = this.settings.jobDescription 
      ? `\n- Job Description Context: ${this.settings.jobDescription}`
      : "";

    const existingBulletsContext = existingBulletPoints.length > 0 
      ? `\n\nEXISTING ACHIEVEMENTS FOR THIS POSITION:
${existingBulletPoints.map((bullet, index) => `${index + 1}. ${bullet}`).join('\n')}

IMPORTANT: Analyze the starting words of existing achievements above and use DIFFERENT action verbs and sentence structures.`
      : "";

    // Create position-specific guidance
    const positionGuidance = this.getPositionSpecificGuidance(context.position);

    return `You are a professional resume writer. Enhance this achievement bullet point with the following guidelines:

ORIGINAL: "${originalText}"

CONTEXT:
- Company: ${context.company}
- Position: ${context.position}${jobDescriptionContext}${existingBulletsContext}

POSITION-SPECIFIC GUIDANCE:
${positionGuidance}

REQUIREMENTS:
- ${lengthGuidance}
- Use diverse, strong action verbs appropriate for ${context.position} role
- AVOID repeating action verbs from existing achievements (if any shown above)
- Vary sentence structure and phrasing to create distinct achievements
- Only include metrics explicitly mentioned in original text - DO NOT fabricate numbers
- Show clear impact using provided information
- Stay truthful to original content
- Use professional, impactful language

RESPONSE FORMAT:
Provide ONLY the enhanced text enclosed in double quotes. No explanations, rationale, or additional text.

"enhanced achievement text goes here"`;
  }

  private async makeAPICall(prompt: string): Promise<string> {
    const { provider, model, customModel } = this.settings;
    
    // Get API key from secure storage
    const apiKey = await getApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Please configure your AI settings and ensure your API key is saved.`);
    }
    
    const finalModel = customModel?.trim() || model || this.getDefaultModel(provider);

    // Use proxy endpoint to avoid CORS issues
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        apiKey,
        model: finalModel,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content || '';
  }

  private getDefaultModel(provider: string): string {
    switch (provider) {
      case "openai":
        return "gpt-4";
      case "anthropic":
        return "claude-3-5-sonnet-20240620";
      case "gemini":
        return "gemini-pro";
      default:
        return "";
    }
  }


  private parseBulletPointsFromResponse(response: string): string[] {
    const lines = response.split("\n").filter(line => line.trim());
    return lines
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(line => line.length > 0);
  }

  private getPositionSpecificGuidance(position: string): string {
    const positionLower = position.toLowerCase();
    
    if (positionLower.includes('senior') || positionLower.includes('lead') || positionLower.includes('principal')) {
      return `For senior/leadership roles, emphasize:
- Strategic initiatives and architectural decisions
- Team leadership and mentoring activities
- Cross-functional collaboration and influence
- System-wide improvements and scalability
Suggested action verbs: Spearheaded, Orchestrated, Championed, Established, Transformed, Pioneered`;
    }
    
    if (positionLower.includes('cloud') || positionLower.includes('devops') || positionLower.includes('infrastructure')) {
      return `For cloud/infrastructure roles, emphasize:
- Infrastructure automation and optimization
- CI/CD pipeline improvements
- Security and compliance initiatives
- Cost optimization and resource management
Suggested action verbs: Automated, Optimized, Streamlined, Implemented, Configured, Modernized`;
    }
    
    if (positionLower.includes('software') || positionLower.includes('engineer') || positionLower.includes('developer')) {
      return `For software engineering roles, emphasize:
- Technical implementations and feature development
- Performance improvements and bug fixes
- Code quality and testing initiatives
- Technology adoption and integration
Suggested action verbs: Built, Engineered, Refactored, Integrated, Deployed, Enhanced`;
    }
    
    if (positionLower.includes('data') || positionLower.includes('analytics')) {
      return `For data/analytics roles, emphasize:
- Data pipeline development and optimization
- Analytics insights and business impact
- Machine learning model development
- Data quality and governance
Suggested action verbs: Analyzed, Modeled, Processed, Extracted, Visualized, Predicted`;
    }
    
    // Generic guidance for any position
    return `Focus on achievements that demonstrate:
- Technical skill and expertise relevant to the role
- Problem-solving and innovation
- Collaboration and communication
- Results and business impact
Suggested action verbs: Delivered, Achieved, Collaborated, Resolved, Improved, Executed`;
  }

  private extractQuotedContent(response: string): string {
    console.log('Original AI response:', response);
    
    // First, try to find content within quotes - handle both regular and smart quotes
    const quotePatterns = [
      /"([^"]+)"/g,  // Regular quotes
      /[""]([^""]+)[""]?/g,  // Smart quotes
      /[""]([^""]+)[""]?/g,  // Different smart quote variations
    ];
    
    for (const pattern of quotePatterns) {
      const matches = Array.from(response.matchAll(pattern));
      if (matches.length > 0) {
        // Get the first (and usually longest) quoted section
        const longestMatch = matches.reduce((prev, current) => 
          current[1].length > prev[1].length ? current : prev
        );
        
        if (longestMatch && longestMatch[1] && longestMatch[1].trim().length > 10) {
          const extracted = longestMatch[1].trim();
          console.log('Extracted quoted content:', extracted);
          return extracted;
        }
      }
    }
    
    console.log('No quotes found, trying line-based extraction');
    
    // If no quotes found, look for the first line that looks like an achievement
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    for (const line of lines) {
      // Skip common AI response patterns
      if (line && 
          !line.toLowerCase().includes('here\'s') &&
          !line.toLowerCase().includes('rationale') &&
          !line.toLowerCase().includes('enhancement') &&
          !line.startsWith('•') && 
          !line.startsWith('-') && 
          !line.startsWith('*') &&
          !line.match(/^(Key|Enhanced|Improved|The revised)/i) &&
          line.length > 20 &&
          // Look for lines that start with action verbs (typical of achievements)
          line.match(/^[A-Z][a-z]+(ed|d|s)\s/)) {
        console.log('Using line-based extraction:', line);
        return line;
      }
    }
    
    // Last resort - return the first substantial line
    const firstSubstantialLine = lines.find(line => line.length > 20);
    if (firstSubstantialLine) {
      console.log('Using first substantial line:', firstSubstantialLine);
      return firstSubstantialLine;
    }
    
    console.log('Using original response as fallback');
    return response.trim();
  }
}

export const createAIService = (settings: AISettings) => new AIService(settings);