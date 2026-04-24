/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MCQ {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  distractor_explanations?: string[];
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  output: string | null;
}
