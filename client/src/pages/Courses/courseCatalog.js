import {
  BookOpen,
  Brain,
  Calculator,
  FlaskConical,
  Languages,
  Landmark,
  Monitor,
  PencilLine
} from 'lucide-react'

export const COURSE_CATEGORIES = [
  { value: 'Foundation', label: 'Foundation', icon: BookOpen },
  { value: 'Mathematics', label: 'Mathematics', icon: Calculator },
  { value: 'Science', label: 'Science', icon: FlaskConical },
  { value: 'Commerce', label: 'Commerce', icon: Landmark },
  { value: 'English', label: 'English', icon: PencilLine },
  { value: 'Hindi', label: 'Hindi', icon: Languages },
  { value: 'Sanskrit', label: 'Sanskrit', icon: Brain },
  { value: 'Computer Science', label: 'Computer Science', icon: Monitor }
]

export const COURSE_CATEGORY_OPTIONS = COURSE_CATEGORIES.map((category) => ({
  value: category.value,
  label: category.label
}))

export function getCourseCategory(course) {
  return course.category || inferCourseCategory(course.title) || 'Foundation'
}

export function inferCourseCategory(title = '') {
  const normalized = title.toLowerCase()

  if (normalized.includes('math')) return 'Mathematics'
  if (normalized.includes('physics') || normalized.includes('chemistry') || normalized.includes('science')) return 'Science'
  if (normalized.includes('commerce') || normalized.includes('account') || normalized.includes('business')) return 'Commerce'
  if (normalized.includes('english')) return 'English'
  if (normalized.includes('hindi')) return 'Hindi'
  if (normalized.includes('sanskrit')) return 'Sanskrit'
  if (normalized.includes('computer') || normalized.includes('coding')) return 'Computer Science'

  return 'Foundation'
}

export function getCourseImage(category) {
  const imageMap = {
    Foundation: '/images/home-hero.png',
    Mathematics: '/images/home-slide-science.svg',
    Science: '/images/home-slide-science.svg',
    Commerce: '/images/home-slide-library.svg',
    English: '/images/home-slide-library.svg',
    Hindi: '/images/home-slide-library.svg',
    Sanskrit: '/images/home-slide-library.svg',
    'Computer Science': '/images/home-slide-science.svg'
  }

  return imageMap[category] || imageMap.Foundation
}
