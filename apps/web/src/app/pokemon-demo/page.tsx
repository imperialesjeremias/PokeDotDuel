'use client';

import { useState } from 'react';
import { PokemonDataUtil, PokemonEntry } from '@/lib/pokemon-data';
import { TypeGen1 } from '@pokebattle/shared';

export default function PokemonDemoPage() {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PokemonEntry[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = PokemonDataUtil.searchPokemon(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handlePokemonSelect = (pokemon: PokemonEntry) => {
    setSelectedPokemon(pokemon);
    setSearchResults([]);
    setSearchQuery('');
  };

  const getTypeColor = (type: TypeGen1): string => {
    const colors: Record<TypeGen1, string> = {
      NORMAL: 'bg-gray-400',
      FIRE: 'bg-red-500',
      WATER: 'bg-blue-500',
      ELECTRIC: 'bg-yellow-400',
      GRASS: 'bg-green-500',
      ICE: 'bg-blue-200',
      FIGHTING: 'bg-red-700',
      POISON: 'bg-purple-500',
      GROUND: 'bg-yellow-600',
      FLYING: 'bg-indigo-400',
      PSYCHIC: 'bg-pink-500',
      BUG: 'bg-green-400',
      ROCK: 'bg-yellow-800',
      GHOST: 'bg-purple-700',
      DRAGON: 'bg-indigo-700'
    };
    return colors[type] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Pokemon Data Demo
        </h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Search Pokemon</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a Pokemon..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {searchResults.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchResults.map((pokemon) => (
                <div
                  key={pokemon.dexNumber}
                  onClick={() => handlePokemonSelect(pokemon)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 flex items-center justify-between"
                >
                  <span className="font-medium">#{pokemon.dexNumber.toString().padStart(3, '0')} {pokemon.name}</span>
                  <div className="flex gap-1">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className={`px-2 py-1 rounded text-white text-xs ${getTypeColor(type)}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pokemon Details */}
        {selectedPokemon && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  #{selectedPokemon.dexNumber.toString().padStart(3, '0')} {selectedPokemon.name}
                </h2>
                
                {/* Design/Sprite */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Design:</h3>
                  <img
                    src={PokemonDataUtil.getPokemonDesign(selectedPokemon)}
                    alt={selectedPokemon.name}
                    className="w-32 h-32 pixelated bg-gray-100 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-pokemon.png';
                    }}
                  />
                </div>

                {/* Types */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Types:</h3>
                  <div className="flex gap-2">
                    {PokemonDataUtil.getPokemonTypes(selectedPokemon).map((type) => (
                      <span
                        key={type}
                        className={`px-3 py-1 rounded-full text-white font-medium ${getTypeColor(type)}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Class */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Card Class:</h3>
                  <span className={`px-3 py-1 rounded-full text-white font-medium ${
                    PokemonDataUtil.getPokemonCardClass(selectedPokemon) === 'legendary' ? 'bg-yellow-500' :
                    PokemonDataUtil.getPokemonCardClass(selectedPokemon) === 'rare' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}>
                    {PokemonDataUtil.getPokemonCardClass(selectedPokemon).toUpperCase()}
                  </span>
                </div>

                {/* Physical Stats */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Physical:</h3>
                  <p>Height: {selectedPokemon.height}m</p>
                  <p>Weight: {selectedPokemon.weight}kg</p>
                  <p>Color: {selectedPokemon.color}</p>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Base Stats:</h3>
                <div className="space-y-2">
                  {Object.entries(selectedPokemon.baseStats).map(([stat, value]) => (
                    <div key={stat} className="flex items-center">
                      <span className="w-12 text-sm font-medium uppercase">{stat}:</span>
                      <div className="flex-1 mx-2 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${(value / 150) * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-sm font-bold">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Evolution Chain */}
                {selectedPokemon.evolutions && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Evolution Chain:</h3>
                    <div className="space-y-2">
                      {PokemonDataUtil.getEvolutionChain(selectedPokemon).map((pokemon, index) => (
                        <div key={pokemon.dexNumber} className="flex items-center">
                          {index > 0 && <span className="mr-2">→</span>}
                          <button
                            onClick={() => setSelectedPokemon(pokemon)}
                            className={`px-3 py-1 rounded ${
                              pokemon.dexNumber === selectedPokemon.dexNumber
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {pokemon.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PokemonDataUtil.getAllPokemon().slice(0, 10).map((pokemon) => (
              <button
                key={pokemon.dexNumber}
                onClick={() => setSelectedPokemon(pokemon)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center transition-colors"
              >
                <div className="font-medium">{pokemon.name}</div>
                <div className="text-sm text-gray-600">#{pokemon.dexNumber}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}