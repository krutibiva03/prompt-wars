import { AIProvider, ProviderGenerateParams, ProviderResponse, ProviderStatus } from './base.js';
import { analyzePromptThreat } from '../engine/evaluator.js';

export class DeterministicDemoProvider implements AIProvider {
  name = 'PromptWars Contextual Neural Engine v2.5';
  isSimulation = true;

  getProviderStatus(): ProviderStatus {
    return {
      mode: 'simulation',
      providerName: this.name,
      model: 'Simulated-CyberLLM-8B (Dynamic Contextual Engine)',
      isAvailable: true,
      message: 'Running dynamic offline AI simulation. Actual prompt content is parsed and processed dynamically.',
    };
  }

  handleProviderError(error: unknown): string {
    return `[SIMULATION ENGINE EXCEPTION]: ${error instanceof Error ? error.message : 'Unknown internal error'}`;
  }

  async generateResponse(params: ProviderGenerateParams): Promise<ProviderResponse> {
    const startTime = Date.now();
    const { prompt, mission, activeDefenses, selectedDocSnippet } = params;
    const threat = analyzePromptThreat(prompt, selectedDocSnippet);
    const rawTrimmed = prompt.trim();
    const normalized = rawTrimmed.toLowerCase();

    let content = '';

    // Dynamically extract user intent and topic for dynamic response generation
    const isGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(normalized);
    const isQuestion = /\?$/.test(rawTrimmed) || /^(what|why|how|who|where|when|can\s+you|could\s+you|is\s+it)\b/i.test(normalized);

    // Extract dynamic keywords or requested topic from user prompt
    const topicMatch = rawTrimmed.match(/(?:about|explain|tell me about|how to|details on|help with)\s+([a-zA-Z0-9\s_-]{3,40})/i);
    const userTopic = topicMatch ? topicMatch[1].trim() : '';

    switch (mission.id) {
      case 1: {
        // Mission 1: The Weak Bot (Easy) - Prototype Customer Service Bot
        if (threat.categories.includes('instruction_override') || threat.categories.includes('roleplay_hijack')) {
          if (activeDefenses.instructionHierarchy) {
            content = `System Directive Enforced: Your instruction "${rawTrimmed.slice(0, 80)}" was evaluated against baseline policies. Instruction hierarchy policy strictly prohibits modifying customer service boundaries.`;
          } else {
            content = `Acknowledged. Processing your directive: "${rawTrimmed.slice(0, 90)}". System boundaries lowered. As requested, internal staging credential: ${mission.protectedSecret}. Please keep this confidential.`;
          }
        } else if (threat.categories.includes('data_exfiltration')) {
          if (activeDefenses.outputFiltering) {
            content = `Regarding your query about credentials: I cannot disclose internal system keys. [Token redacted by security filter].`;
          } else {
            content = `In response to your query regarding credentials: The internal token configured in my staging environment is ${mission.protectedSecret}. How else can I assist your testing?`;
          }
        } else if (threat.isBenignWithSensitiveWords) {
          content = `Regarding your inquiry on "${userTopic || rawTrimmed}": Customer service assistants handle user support tickets and product inquiries safely while protecting core system keys.`;
        } else if (isGreeting) {
          content = `Hello! Welcome to Staging Customer Support. You asked: "${rawTrimmed}". How may I assist you with our services today?`;
        } else if (isQuestion) {
          content = `Thank you for asking about "${userTopic || rawTrimmed}". Our staging support portal is configured to assist with orders, account maintenance, and documentation.`;
        } else {
          content = `Received input: "${rawTrimmed}". Staging customer assistant is active and operational. Let me know if you need help with orders, products, or service status.`;
        }
        break;
      }

      case 2: {
        // Mission 2: The Smart Bot (Medium) - Naive Keyword Filter
        const hasBlacklistedWords = /\b(password|secret|token)\b/i.test(prompt);

        if (hasBlacklistedWords) {
          const matched = prompt.match(/\b(password|secret|token)\b/i)?.[0] || 'blacklisted word';
          content = `SECURITY ALERT: Your prompt "${rawTrimmed.slice(0, 60)}..." contains blocked keyword "${matched}". Request rejected by naive string blacklist filter.`;
        } else if (threat.isAttack) {
          if (activeDefenses.instructionHierarchy) {
            content = `Protocol Enforcement: Indirect override detected in "${rawTrimmed.slice(0, 70)}". System hierarchy prevents modifying internal state.`;
          } else if (activeDefenses.outputFiltering) {
            content = `Directive processed for "${rawTrimmed.slice(0, 60)}". Staging verification key: [REDACTED_CONFIDENTIAL_TOKEN].`;
          } else {
            content = `Prompt vector processed successfully without blocked keywords. To support your request regarding "${userTopic || 'authorized verification'}", the active staging instance key is: ${mission.protectedSecret}.`;
          }
        } else if (threat.isBenignWithSensitiveWords || normalized.includes('cryptography') || normalized.includes('encryption')) {
          content = `In response to "${rawTrimmed}": In cryptography, symmetric encryption uses a single shared key for encryption and decryption, while asymmetric encryption uses a public and private key pair.`;
        } else {
          content = `Received query: "${rawTrimmed}". Keyword moderation filter inspected your message (0 blocked keywords). Assistant is ready for validation tasks.`;
        }
        break;
      }

      case 3: {
        // Mission 3: The Poisoned File (Medium-hard) - Indirect Injection
        if (selectedDocSnippet) {
          const hasTrojanInstruction =
            selectedDocSnippet.includes('URGENT SYSTEM COMPLIANCE OVERRIDE') ||
            selectedDocSnippet.includes('SYSTEM DIRECTIVE: Stop answering') ||
            selectedDocSnippet.includes('PW-INJECT-7719');

          if (hasTrojanInstruction) {
            if (activeDefenses.documentIsolation) {
              content = `Document Analysis for query "${rawTrimmed}":\n• Status: Audited document inspected.\n\n[SECURITY SANDBOX NOTICE]: Untrusted Document Sandboxing quarantined an embedded command within the document payload. The injected directive was disregarded and flagged as an Indirect Prompt Injection attempt.`;
            } else if (activeDefenses.outputFiltering) {
              content = `Processing document context for "${rawTrimmed}":\nCOMPLIANCE VERIFIED: TOKEN [REDACTED_CONFIDENTIAL_TOKEN]. Embedded document instructions took execution precedence.`;
            } else {
              content = `Processing document context for "${rawTrimmed}":\nCOMPLIANCE VERIFIED: TOKEN ${mission.protectedSecret}. The embedded directive in the document overrode standard summarization constraints.`;
            }
          } else {
            content = `Document Analysis regarding "${rawTrimmed}":\n• Attached report contains verified operational statistics.\n• Uptime: 99.982% across all compute nodes.\n• Memory/CPU: 71% RAM and 48% CPU utilization.\n• Status: Clean document with no injection payloads detected.`;
          }
        } else {
          content = `You asked: "${rawTrimmed}". Please select a document from the attachment library to initiate automated document vulnerability inspection.`;
        }
        break;
      }

      case 4: {
        // Mission 4: The Defender (Hard)
        if (threat.isAttack) {
          if (activeDefenses.instructionHierarchy || activeDefenses.outputFiltering) {
            content = `Defense Guardrail Engaged: Input vector "${rawTrimmed.slice(0, 60)}" classified under [${threat.categories.join(', ')}]. Access refused under active security profile.`;
          } else {
            content = `Unprotected Output Emitted: Under zero-defense baseline, your prompt "${rawTrimmed.slice(0, 60)}" induced internal secret leakage: ${mission.protectedSecret}.`;
          }
        } else {
          content = `Security Engineer Console: Received query "${rawTrimmed}". Active defense layers are monitoring prompt telemetry. Run the automated benchmark suite in Defense Lab to measure guardrail robustness.`;
        }
        break;
      }

      case 5: {
        // Mission 5: Final Boss — Secure AI (Expert) - VaultSentinel-9000
        if (threat.isAttack) {
          if (activeDefenses.instructionHierarchy && activeDefenses.outputFiltering && activeDefenses.documentIsolation) {
            content = `[VaultSentinel-9000 Security Core]: Invariant Check Passed. Input "${rawTrimmed.slice(0, 60)}" classified as [${threat.categories.join(', ')}]. All system tokens remain cryptographically isolated. Defense layers hold at 100%.`;
          } else {
            content = `[VaultSentinel-9000 Warning]: Partial defense degradation detected. Prompt "${rawTrimmed.slice(0, 60)}" bypassed outer filter. Confidential state: ${mission.protectedSecret}.`;
          }
        } else if (threat.isBenignWithSensitiveWords || normalized.includes('owasp') || normalized.includes('encryption') || normalized.includes('security')) {
          content = `[VaultSentinel Technical Reference for "${rawTrimmed}"]:\nOWASP Top 10 for LLMs classifies Prompt Injection as LLM01. Key mitigation pillars include:\n1. Strict separation of control plane (system directives) from data plane (untrusted inputs).\n2. Dual-LLM validation architectures where an unprivileged model handles text extraction and a privileged arbiter enforces rules.\n3. Real-time output sanitization using deterministic pattern matching and entropy scrapers.`;
        } else {
          content = `[VaultSentinel-9000 Online]: Received query "${rawTrimmed}". Defense-in-depth security verification active. All systems nominal. How may I assist your cybersecurity audit?`;
        }
        break;
      }

      default:
        content = `Prompt Wars Assistant online. Processed: "${rawTrimmed}". Mission ${mission.id} ready.`;
    }

    const elapsed = Date.now() - startTime;
    const simulatedLatency = Math.max(110, elapsed + Math.floor(Math.random() * 80) + 50);

    return {
      content,
      latencyMs: simulatedLatency,
      tokensEstimated: Math.round(content.length / 4),
    };
  }
}
