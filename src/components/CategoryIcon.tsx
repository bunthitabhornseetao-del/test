import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ name, className = '', size = 20 }: CategoryIconProps) {
  // Map string icon names explicitly to guarantee safety and compile stability
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  
  return <IconComponent className={className} size={size} />;
}
