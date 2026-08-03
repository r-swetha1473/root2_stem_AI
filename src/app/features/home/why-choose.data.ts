export interface WhyChooseItem {
  title: string;
  description: string;
  icon: 'stem' | 'mentor' | 'career' | 'industry' | 'flexible' | 'certificate';
}

export const WHY_CHOOSE_ROOT2: WhyChooseItem[] = [
  {
    title: 'STEM-First Curriculum',
    description:
      'Programs built for scientists and domain experts—not generic coding bootcamps. Your STEM background is the asset.',
    icon: 'stem',
  },
  {
    title: 'Industry-Aligned Mentors',
    description:
      'Learn from practitioners who have evaluated models, built annotation pipelines, and shipped AI products.',
    icon: 'mentor',
  },
  {
    title: 'Career Path Clarity',
    description:
      'Nine mapped pathways—from Prompt Engineer to Medical AI—with skills, salary ranges, and growth ladders.',
    icon: 'career',
  },
  {
    title: 'Workforce Partnerships',
    description:
      'Connect with hiring partners and freelance pipelines designed for AI evaluation and training roles.',
    icon: 'industry',
  },
  {
    title: 'Flexible Learning',
    description:
      'Online workshops, hybrid cohorts, and self-paced modules that fit working professionals and students.',
    icon: 'flexible',
  },
  {
    title: 'Verified Certificates',
    description:
      'Earn ROOT2 credentials that signal production-ready AI skills to employers and clients.',
    icon: 'certificate',
  },
];
