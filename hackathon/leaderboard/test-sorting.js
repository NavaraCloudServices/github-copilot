// Test script to verify challenge sorting logic
const challenges = [
  { id: '1', category: 'frontend', title: 'Advanced React', skill_level: 'Advanced' },
  { id: '2', category: 'backend', title: 'Simple API', skill_level: 'Beginner' },
  { id: '3', category: 'ai', title: 'ML Pipeline', skill_level: 'Intermediate' },
  { id: '4', category: 'frontend', title: 'HTML Basics', skill_level: 'beginner' }, // lowercase
  { id: '5', category: 'backend', title: 'Auth System', skill_level: 'INTERMEDIATE' }, // uppercase
  { id: '6', category: 'ai', title: 'Neural Network', skill_level: 'advanced' } // lowercase
];

const categories = [
  { id: 'frontend', name: 'Frontend Development' },
  { id: 'backend', name: 'Backend Development' },
  { id: 'ai', name: 'AI & Machine Learning' }
];

// Apply the sorting logic (case-insensitive version)
const sortedChallenges = challenges.sort((a, b) => {
  // First sort by category (alphabetically by category name)
  const categoryA = categories.find(cat => cat.id === a.category)?.name || a.category;
  const categoryB = categories.find(cat => cat.id === b.category)?.name || b.category;
  
  if (categoryA !== categoryB) {
    return categoryA.localeCompare(categoryB);
  }
  
  // Then sort by skill level (Beginner -> Intermediate -> Advanced)
  const skillLevelOrder = { 
    'beginner': 1, 
    'intermediate': 2, 
    'advanced': 3 
  };
  const skillA = skillLevelOrder[a.skill_level?.toLowerCase()] || 999;
  const skillB = skillLevelOrder[b.skill_level?.toLowerCase()] || 999;
  
  if (skillA !== skillB) {
    return skillA - skillB;
  }
  
  // Finally, sort by title as a tiebreaker
  return a.title.localeCompare(b.title);
});

console.log('Sorted challenges (case-insensitive):');
sortedChallenges.forEach((challenge, index) => {
  const category = categories.find(cat => cat.id === challenge.category);
  console.log(`${index + 1}. ${category.name} - ${challenge.title} (${challenge.skill_level})`);
});
