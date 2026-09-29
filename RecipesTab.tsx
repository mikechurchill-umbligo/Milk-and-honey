import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RECIPES, getRecipeCategories, type Recipe } from '@/lib/recipes';
import { BookOpen, ChevronDown, ChevronUp, Search, X, Flame, Snowflake, Coffee, Beaker, ClipboardList, Cloud } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  iced_drink: <Snowflake className="w-4 h-4 text-cyan-500" />,
  hot_drink: <Flame className="w-4 h-4 text-orange-500" />,
  specialty: <Coffee className="w-4 h-4 text-purple-500" />,
  cloud: <Cloud className="w-4 h-4 text-sky-500" />,
  brew_base: <Beaker className="w-4 h-4 text-amber-700" />,
  syrup: <Beaker className="w-4 h-4 text-pink-500" />,
  prep: <ClipboardList className="w-4 h-4 text-gray-500" />,
  procedure: <ClipboardList className="w-4 h-4 text-green-600" />,
};

const categoryColors: Record<string, string> = {
  iced_drink: 'bg-cyan-50 border-cyan-200',
  hot_drink: 'bg-orange-50 border-orange-200',
  specialty: 'bg-purple-50 border-purple-200',
  cloud: 'bg-sky-50 border-sky-200',
  brew_base: 'bg-amber-50 border-amber-200',
  syrup: 'bg-pink-50 border-pink-200',
  prep: 'bg-gray-50 border-gray-200',
  procedure: 'bg-green-50 border-green-200',
};

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all ${categoryColors[recipe.category] || 'bg-white'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0">
              {categoryIcons[recipe.category]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">{recipe.name}</h3>
                {recipe.decaf && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">DECAF</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{recipe.size}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <ol className="space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="font-semibold text-primary/70 flex-shrink-0 w-5 text-right">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {recipe.notes && (
              <div className="mt-3 p-2 bg-background/60 rounded text-xs text-muted-foreground">
                <span className="font-semibold">Note:</span> {recipe.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

interface RecipesTabProps {
  initialSearch?: string;
  onSearchUsed?: () => void;
}

export function RecipesTab({ initialSearch, onSearchUsed }: RecipesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getRecipeCategories();

  // Apply voice search when it comes in
  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      setSelectedCategory(null);
      onSearchUsed?.();
    }
  }, [initialSearch, onSearchUsed]);

  const isDecafSearch = searchTerm.toLowerCase() === 'decaf' || searchTerm.toLowerCase() === 'caffeine free';

  const filtered = RECIPES.filter(recipe => {
    // Special decaf filter
    if (isDecafSearch) {
      return recipe.decaf === true;
    }
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      recipe.name.toLowerCase().includes(term) ||
      recipe.steps.some(s => s.toLowerCase().includes(term)) ||
      (recipe.ingredients && recipe.ingredients.some(i => i.toLowerCase().includes(term))) ||
      (term === 'decaf' && recipe.decaf);
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Group by category for display
  const grouped = filtered.reduce((acc, recipe) => {
    if (!acc[recipe.category]) acc[recipe.category] = [];
    acc[recipe.category].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes... (e.g. chai, lemonade, 208)"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value) setSelectedCategory(null); }}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedCategory === null && !searchTerm ? 'default' : 'outline'}
          onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}
        >
          All ({RECIPES.length})
        </Button>
        {categories.map(cat => {
          const count = RECIPES.filter(r => r.category === cat.id).length;
          return (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => { setSelectedCategory(cat.id); setSearchTerm(''); }}
              className="gap-1.5"
            >
              {categoryIcons[cat.id]}
              {cat.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No recipes found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
        </Card>
      ) : selectedCategory ? (
        // Flat list when filtering by category
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        // Grouped by category when showing all
        <div className="space-y-6">
          {categories
            .filter(cat => grouped[cat.id]?.length)
            .map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  {categoryIcons[cat.id]}
                  <h3 className="font-semibold text-foreground">{cat.label}</h3>
                  <span className="text-xs text-muted-foreground">({grouped[cat.id].length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grouped[cat.id].map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
