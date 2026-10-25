import React from 'react';
import {
  Image,
  Video,
  Code2,
  BookOpen,
  Sparkles,
  TrendingUp,
  FileText,
  Boxes,
  Music,
  Folder,
  Layers,
  LucideProps,
} from 'lucide-react';

export const renderCategoryIcon = (iconName: string, props: LucideProps = { className: 'w-4 h-4' }) => {
  switch (iconName.toLowerCase()) {
    case 'image':
      return <Image {...props} />;
    case 'video':
      return <Video {...props} />;
    case 'code':
    case 'code2':
      return <Code2 {...props} />;
    case 'bookopen':
    case 'writing':
    case 'book':
      return <BookOpen {...props} />;
    case 'sparkles':
    case 'marketing':
      return <Sparkles {...props} />;
    case 'trendingup':
    case 'business':
    case 'chart':
      return <TrendingUp {...props} />;
    case 'audio':
    case 'music':
      return <Music {...props} />;
    case '3d':
    case 'boxes':
      return <Boxes {...props} />;
    case 'text':
      return <FileText {...props} />;
    default:
      return <Folder {...props} />;
  }
};
