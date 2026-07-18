'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, X, Sparkles, User, Tv, BookOpen } from 'lucide-react';

interface CharacterInfo {
  // Shared
  description?: string;
  popularity?: string;
  genre?: string[];
  isLoading?: boolean;
  error?: string;

  // Character (Figures)
  characterName?: string;
  animeName?: string;
  series?: string;
  traits?: string[];

  // Series (Manga)
  seriesName?: string;
  author?: string;
  volumes?: string;
  themes?: string[];
}

interface ProductInfoAssistantProps {
  productName: string;
  productDescription?: string;
  category: 'manga' | 'figures' | 'tshirts' | 'other';
}

export default function ProductInfoAssistant({
  productName,
  productDescription,
  category
}: ProductInfoAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCharacterInfo = async () => {
    if (characterInfo && !characterInfo.error) return; // Already fetched successfully

    setIsLoading(true);
    try {
      console.log('Fetching character info for:', productName);

      const response = await fetch('/api/character-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productDescription,
          category
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Character info received:', data);
      setCharacterInfo(data);
    } catch (error) {
      console.error('Error fetching character info:', error);
      setCharacterInfo({
        error: `Sorry, I couldn't analyze this character. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchCharacterInfo();
    }
    setIsOpen(!isOpen);
  };

  // Only show for manga and figures
  if (category === 'tshirts' || category === 'other') return null;
  const isManga = category === 'manga';

  return (
    <div className="relative">
      {/* Info Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2 text-blue-500 hover:text-white border-blue-500 hover:border-blue-600 bg-background hover:bg-blue-500 transition-all duration-200"
      >
        <Sparkles className="h-4 w-4" />
        {isManga ? "Series Info" : "Character Info"}
        <Info className="h-4 w-4" />
      </Button>

      {/* Info Modal/Bubble */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-gradient-to-br from-card to-blue-50 dark:to-blue-950/30">
            <CardHeader className="relative pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
              </Button>

              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-blue-500" />
                {isManga ? "AI Series Reference" : "AI Character Assistant"}
              </CardTitle>
              <CardDescription>
                {isManga ? "Here are some details about this overarching series." : "Let me tell you about this character!"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-muted-foreground">{isManga ? "Finding series details..." : "Analyzing character..."}</span>
                </div>
              ) : characterInfo?.error ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>{characterInfo.error}</p>
                </div>
              ) : characterInfo ? (
                <div className="space-y-4">
                  {/* Manga Specific Info */}
                  {isManga && characterInfo.seriesName && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">Series:</span>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">{characterInfo.seriesName}</span>
                    </div>
                  )}
                  {isManga && characterInfo.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">Mangaka:</span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">{characterInfo.author}</span>
                    </div>
                  )}
                  {isManga && characterInfo.volumes && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">Volumes:</span>
                      <span className="text-green-700 dark:text-green-300 font-medium">{characterInfo.volumes}</span>
                    </div>
                  )}

                  {/* Character Specific Info */}
                  {!isManga && characterInfo.characterName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">Character:</span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">{characterInfo.characterName}</span>
                    </div>
                  )}
                  {!isManga && characterInfo.animeName && (
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">From:</span>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">{characterInfo.animeName}</span>
                    </div>
                  )}
                  {!isManga && characterInfo.series && characterInfo.series !== characterInfo.animeName && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">Series:</span>
                      <span className="text-green-700 dark:text-green-300 font-medium">{characterInfo.series}</span>
                    </div>
                  )}

                  {/* Shared Info */}
                  {/* Description */}
                  {characterInfo.description && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {characterInfo.description}
                      </p>
                    </div>
                  )}

                  {/* Traits / Themes */}
                  {!isManga && characterInfo.traits && characterInfo.traits.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm text-muted-foreground mb-2 block">Character Traits:</span>
                      <div className="flex flex-wrap gap-2">
                        {characterInfo.traits.map((trait, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {isManga && characterInfo.themes && characterInfo.themes.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm text-muted-foreground mb-2 block">Themes:</span>
                      <div className="flex flex-wrap gap-2">
                        {characterInfo.themes.map((theme, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  {characterInfo.genre && characterInfo.genre.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm text-muted-foreground mb-2 block">Genres:</span>
                      <div className="flex flex-wrap gap-2">
                        {characterInfo.genre.map((g, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popularity */}
                  {characterInfo.popularity && (
                    <div className="text-xs text-muted-foreground italic text-center pt-2 border-t">
                      💫 {characterInfo.popularity}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>{isManga ? "Ready to dive into this series!" : "Ready to learn about this character!"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}