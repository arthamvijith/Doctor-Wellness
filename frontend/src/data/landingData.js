import { Bot, FileText, Stethoscope } from 'lucide-react';

export const assistants = [
  {
    icon: Stethoscope,
    title: 'Clinical Assistant',
    points: [
      'Automated medical history gathering and risk assessment.',
      'Real-time AI diagnostic support and insights.',
      'Intelligent prescription checking for interactions.'
    ]
  },
  {
    icon: Bot,
    title: 'Personal Assistant',
    points: [
      'Drafting professional emails and medical reports.',
      'Calendar management with priority buffer zones.',
      'Voice-to-text dictation optimized for medical jargon.'
    ]
  },
  {
    icon: FileText,
    title: 'Academic Assistant',
    points: [
      'Instant retrieval of the latest peer-reviewed research.',
      'Summary generation for medical journals and papers.',
      'Flashcard creation for continued medical education.'
    ]
  }
];
