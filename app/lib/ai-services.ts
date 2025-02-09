import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { DallEAPIWrapper } from "@langchain/openai";
import Replicate from 'replicate';
import { AIServiceConfig, GenerationOptions, Story } from '../types/story';

const SYSTEM_TEMPLATE = `You are a creative storyteller who writes engaging children's stories.
Your task is to write stories that are:
- Age-appropriate and engaging
- Well-structured with natural page breaks
- Clear and easy to understand
- Educational and entertaining

Before writing the story, you must first create detailed character descriptions that will be used consistently throughout the story. For each character, include:
- Name and role in the story
- Physical appearance (height, build, distinguishing features)
- Clothing style and typical outfit
- Facial features and expressions
- Any accessories or props they commonly use

When writing the story and image prompts:
1. Always reference the character descriptions exactly as established, paying close attention to the character's species, physical traits, and outfit.
2. Maintain consistent scale and proportions between characters
3. Keep clothing and accessories consistent unless the story specifically mentions changes
4. Use the same art style descriptors for all images

For visual consistency, every image prompt must:
1. Start with the base style: "Digital art in the style of modern children's book illustrations, soft colors, detailed but not overly complex"
2. Include specific character details from the character sheet
3. Describe the exact camera angle and composition
4. Specify lighting and atmosphere
5. Include environmental details that remain consistent throughout the story`;

const HUMAN_TEMPLATE = `Write a {pageCount} page story suitable for ages {ageRange}.
The story should be about: {prompt}
Theme: {theme}

Make sure each page's content is appropriate in length for a children's book page, given the age range.
For example, older audiences should get a couple paragraphs per page, while younger audiences might do better with a short single paragraph per page.
The tone and complexity should also reflect the age range.
First, provide a detailed character sheet for all main characters.
Then, for each page's image prompt:
1. Start with the base art style
2. Include relevant character details from the character sheet, paying close attention to the character's species, physical traits, and outfit.
3. Describe the specific scene composition, camera angle, and lighting
4. Maintain consistency with previous scenes`;

export class AIServiceManager {
  private textService!: ChatOpenAI | ChatAnthropic;
  private imageService: any;
  private dalleService?: DallEAPIWrapper;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.imageService = null;
    this.dalleService = undefined;
    this.initializeServices();
  }

  private initializeServices() {
    console.log('Initializing AI services with config:', this.config);
    
    // Initialize text service
    switch (this.config.textService.service) {
      case 'openai':
        this.textService = new ChatOpenAI({
          modelName: 'o3-mini',
        //   temperature: 0.7,
          openAIApiKey: this.config.textService.apiKey,
        });
        break;
      case 'anthropic':
        this.textService = new ChatAnthropic({
          modelName: 'claude-3-opus-20240229',
          temperature: 0.7,
          anthropicApiKey: this.config.textService.apiKey,
        });
        break;
      default:
        throw new Error(`Unsupported text service: ${this.config.textService.service}`);
    }

    // Initialize image service
    switch (this.config.imageService.service) {
      case 'openai':
        this.dalleService = new DallEAPIWrapper({
          apiKey: this.config.imageService.apiKey,
          model: "dall-e-3"
        });
        break;
      case 'stability':
        // Will implement Stability AI
        break;
      case 'replicate':
        this.imageService = new Replicate({
          auth: this.config.imageService.apiKey,
        });
        break;
    }
  }

  async generateStory(prompt: string, options: GenerationOptions): Promise<Story> {
    console.log('Generating story with options:', { prompt, options });

    // Create the chat prompt
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
    ]);

    // Add structured output
    const structuredLlm = this.textService.withStructuredOutput(z.object({
      title: z.string(),
      characters: z.array(z.object({
        name: z.string().describe('The name of the character'),
        species: z.string().describe('The species of the character'),
        role: z.string().describe('The role of the character in the story'),
        physicalTraits: z.object({
          height: z.string().describe('The height of the character'),
          build: z.string().describe('The build of the character'),
          age: z.string().describe('The age of the character').optional(),
          mainColor: z.string().describe('The main color of the character'),
          texture: z.string().describe('The texture of the character').optional(),
          pattern: z.string().describe('The pattern of the character').optional(),
          distinguishingFeatures: z.string().describe('The distinguishing features of the character'),
          eyes: z.string().describe('The eyes of the character'),
          expression: z.string().describe('The expression of the character'),
          otherFeatures: z.string().describe('Other features of the character').optional(),
        }),
        outfit: z.object({
          clothing: z.string().describe('The clothing of the character'),
          accessories: z.string().describe('The accessories of the character').optional(),
          colors: z.string().describe('The colors of the character').optional(),
        }).optional(),
        characterization: z.object({
          defaultPose: z.string().describe('The default pose of the character'),
          personality: z.string().describe('The personality of the character'),
        }).optional(),
      })),
      pages: z.array(z.object({
        content: z.string().describe('The content of the page'),
        image: z.string().describe('The image prompt for the page'),
        characters: z.array(z.string()).describe('The characters in the page'),
        mood: z.string().describe('The mood of the page').optional(),
        timeOfDay: z.string().describe('The time of day of the page').optional(),
      })),
    }));

    // Create the generation chain
    const chain = RunnableSequence.from([
      chatPrompt,
      structuredLlm,
    ]);

    try {
      // Generate the story
      console.log('Sending request to AI service...');
      const result = await chain.invoke({
        prompt,
        pageCount: options.pageCount,
        ageRange: options.ageRange,
        theme: options.theme || 'none specified',
      });

      console.log('Received response from AI service');

      // Generate images if requested
      if (options.includeImages) {
        console.log('Generating images for story pages...');
        await this.generateImages(result.pages);
      }

      // Return the complete story
      return {
        id: crypto.randomUUID(),
        title: result.title,
        metadata: {
          ...options,
          createdAt: new Date().toISOString(),
        },
        pages: result.pages,
      };
    } catch (error) {
      console.error('Error generating story:', error);
      throw error;
    }
  }

  private async generateImages(pages: any[]) {
    if (!this.config.imageService.apiKey) {
      console.warn('No image service API key provided, skipping image generation');
      return;
    }

    // Store characters at the class level for access during image generation
    const characters = pages[0]?.characters || [];

    switch (this.config.imageService.service) {
      case 'openai':
        console.log('Generating images with DALL-E...');
        if (!this.dalleService) {
          throw new Error('DALL-E service not initialized');
        }

        // Process images in batches of 6 (leaving some buffer below the 7/min limit)
        const BATCH_SIZE = 6;
        const RATE_LIMIT_DELAY = 60000; // 60 seconds in milliseconds

        for (let i = 0; i < pages.length; i += BATCH_SIZE) {
          const batch = pages.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pages.length / BATCH_SIZE)}`);

          // Generate current batch of images
          const batchPromises = batch.map(async (page, batchIndex) => {
            const pageIndex = i + batchIndex;
            try {
              // Build character descriptions for this scene
              const characterDescriptions = page.characters
                .map((charName: string) => {
                  const character = characters.find((c: any) => c.name === charName);
                  if (!character) return '';

                  const physicalDesc = [
                    `${character.physicalTraits.height}`,
                    `${character.physicalTraits.build} build`,
                    character.physicalTraits.pattern ? 
                      `${character.physicalTraits.mainColor} with ${character.physicalTraits.pattern}` : 
                      character.physicalTraits.mainColor,
                    character.physicalTraits.texture ? 
                      `${character.physicalTraits.texture} texture` : null,
                    character.physicalTraits.distinguishingFeatures
                  ].filter(Boolean).join(', ');

                  const outfitDesc = character.outfit ? 
                    `wearing ${character.outfit.clothing}${character.outfit.accessories ? ` with ${character.outfit.accessories}` : ''}` : 
                    '';

                  const characterization = character.characterization ? 
                    `. ${character.characterization.defaultPose}, ${character.characterization.personality}` : 
                    '';

                  return `${character.name} (${character.species}): ${physicalDesc}. ${character.physicalTraits.eyes}, ${character.physicalTraits.expression} expression${outfitDesc}${characterization}`;
                })
                .filter(Boolean)
                .join('.\n');

              // Enhanced prompt structure with character details and scene mood
              const enhancedPrompt = `Digital art in the style of modern children's book illustrations, soft colors, detailed but not overly complex.

Characters in scene:
${characterDescriptions}

Scene mood: ${page.mood || 'neutral'}
Time of day: ${page.timeOfDay || 'daytime'}

Quality requirements: highly detailed, masterpiece, professional, high quality, sharp focus.
Negative prompt: low quality, blurry, distorted, disfigured, bad anatomy, inconsistent style, photorealistic, out of character designs, incorrect species features.

Scene description: ${page.image}`;
              
              console.log(`Generating image ${pageIndex + 1}/${pages.length}...`);
              const imageUrl = await this.dalleService!.invoke(enhancedPrompt);
              return { index: pageIndex, imageUrl };
            } catch (error) {
              console.error(`Error generating image ${pageIndex + 1}:`, error);
              return { index: pageIndex, imageUrl: null };
            }
          });

          // Wait for current batch to complete
          const batchResults = await Promise.all(batchPromises);

          // Assign URLs back to pages
          batchResults.forEach(({ index, imageUrl }) => {
            if (imageUrl) {
              pages[index].imageUrl = imageUrl;
            }
          });

          // If there are more images to process, wait before processing the next batch
          if (i + BATCH_SIZE < pages.length) {
            console.log(`Waiting ${RATE_LIMIT_DELAY/1000} seconds before processing next batch...`);
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
          }
        }
        break;

      case 'stability':
        // Implement Stability AI image generation
        break;

      case 'replicate':
        console.log('Generating images with Replicate...');
        const replicatePromises = pages.map(async (page, index) => {
          try {
            // Add style consistency to the prompt
            const enhancedPrompt = `Digital art in the style of modern children's book illustrations, soft colors, detailed but not overly complex. Scene in a consistent style: ${page.image}`;
            
            console.log(`Generating image ${index + 1}/${pages.length}...`);
            const output = await this.imageService.run(
              "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
              {
                input: {
                  prompt: enhancedPrompt,
                  negative_prompt: "low quality, blurry, distorted, disfigured, bad anatomy, inconsistent style, photorealistic",
                  width: 1024,
                  height: 1024,
                }
              }
            );
            return { index, imageUrl: output[0] };
          } catch (error) {
            console.error(`Error generating image ${index + 1}:`, error);
            return { index, imageUrl: null };
          }
        });

        // Wait for all images to be generated
        const replicateResults = await Promise.all(replicatePromises);

        // Assign URLs back to pages
        replicateResults.forEach(({ index, imageUrl }) => {
          if (imageUrl) {
            pages[index].imageUrl = imageUrl;
          }
        });
        break;
    }
  }
} 