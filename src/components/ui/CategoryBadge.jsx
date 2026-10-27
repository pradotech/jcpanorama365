import { getCategoryById } from '../../data/categories';

export default function CategoryBadge({ categoryId, size = 'sm' }) {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  const Icon = category.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full transition-all duration-200 hover:scale-105 ${sizeClasses[size]}`}
      style={{
        backgroundColor: category.bgLight,
        color: category.color,
      }}
    >
      <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      {category.name}
    </span>
  );
}
