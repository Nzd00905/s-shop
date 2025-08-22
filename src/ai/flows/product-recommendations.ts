'use server';

/**
 * @fileOverview Recommends products to users based on their viewing history.
 *
 * - productRecommendations - A function that recommends products based on user viewing history.
 * - ProductRecommendationsInput - The input type for the productRecommendations function.
 * - ProductRecommendationsOutput - The return type for the productRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationsInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of product names the user has viewed.'),
});
export type ProductRecommendationsInput = z.infer<typeof ProductRecommendationsInputSchema>;

const ProductRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of product names recommended to the user.'),
});
export type ProductRecommendationsOutput = z.infer<typeof ProductRecommendationsOutputSchema>;

export async function productRecommendations(input: ProductRecommendationsInput): Promise<ProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: ProductRecommendationsInputSchema},
  output: {schema: ProductRecommendationsOutputSchema},
  prompt: `Based on the user's viewing history, recommend products they might be interested in.

Viewing History: {{#each viewingHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Recommendations:`,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: ProductRecommendationsInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error("AI recommendation flow failed:", error);
      // Return empty recommendations on failure to prevent crashes
      return { recommendations: [] };
    }
  }
);
