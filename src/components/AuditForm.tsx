import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { AuditInputs, BusinessProfile } from '../types';

interface AuditFormProps {
  onRunAudit: (business: BusinessProfile, inputs: AuditInputs) => void;
  isLoading: boolean;
  mapsApiKey: string;
  setMapsApiKey: (key: string) => void;
  isMapsLoaded: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ onRunAudit, isLoading, mapsApiKey, isMapsLoaded }) => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [h1Text, setH1Text] = useState('');
  const [titleTag, setTitleTag] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [searchError, setSearchError] = useState<string | null>(null);

  // Place Search State
  const [searchValue, setSearchValue] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<BusinessProfile | null>(null);
  
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Initialize Maps Services when Script Loaded
  useEffect(() => {
    if (isMapsLoaded && (window as any).google) {
      try {
        if (!autocompleteService.current) {
          autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
        }
        if (!placesService.current) {
          const dummyNode = document.createElement('div');
          placesService.current = new (window as any).google.maps.places.PlacesService(dummyNode);
        }
      } catch (e) {
        console.error("Error initializing Maps services:", e);
        setSearchError("Failed to initialize Maps services.");
      }
    }
  }, [isMapsLoaded, mapsApiKey]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    setSelectedPlace(null);
    setSearchError(null);

    if (!autocompleteService.current) {
      if (mapsApiKey && !isMapsLoaded) {
        // Still loading, silent return
        return;
      }
      if (val.length > 2) setSearchError("Google Maps service not ready. Please refresh or check API key.");
      return;
    }

    if (val.length > 2) {
      autocompleteService.current.getPlacePredictions({ input: val }, (predictions: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
          setSearchError(null);
        } else if (status === (window as any).google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
          setSearchError(null);
        } else {
          setPredictions([]);
          // Handle specific API errors
          if (status === 'REQUEST_DENIED') {
            setSearchError("API Error: Request Denied. Please check API Key permissions (Places API enabled?)");
          } else if (status === 'OVER_QUERY_LIMIT') {
            setSearchError("API Error: Quota exceeded or billing not enabled on Google Cloud.");
          } else {
            // Only show generic error if input is substantial
             setSearchError(`Search unavailable (Status: ${status})`);
          }
        }
      });
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPrediction = (placeId: string, description: string) => {
    setSearchValue(description);
    setPredictions([]);
    setSearchError(null);

    if (placesService.current) {
      placesService.current.getDetails({
        placeId: placeId,
        fields: ['name', 'formatted_address', 'types', 'rating', 'user_ratings_total', 'website', 'geometry', 'photos', 'reviews']
      }, (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
           const profile: BusinessProfile = {
             placeId: placeId,
             name: place.name,
             address: place.formatted_address,
             rating: place.rating || 0,
             user_ratings_total: place.user_ratings_total || 0,
             types: place.types || [],
             website: place.website,
             location: {
               lat: place.geometry?.location?.lat(),
               lng: place.geometry?.location?.lng()
             },
             photos: place.photos || [],
             reviews: place.reviews || []
           };
           setSelectedPlace(profile);
           
           // Auto-fill city if possible from address
           const addressParts = place.formatted_address.split(',');
           if (addressParts.length >= 2) {
             setCity(addressParts[addressParts.length - 2].trim().split(' ')[0]); // heuristic
           }
        } else {
           setSearchError("Failed to load business details.");
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION UX
    if (!selectedPlace) {
      if (!searchValue) {
         const inputEl = document.getElementById('business-search-input');
         inputEl?.focus();
      } else if (predictions.length > 0) {
         alert("Please click one of the business suggestions in the dropdown list to continue.");
      } else if (searchError) {
         alert(searchError);
      } else {
         alert("No valid business selected. Please select a business from the dropdown suggestions.");
      }
      return;
    }

    const inputs: AuditInputs = {
      targetKeyword: keyword,
      targetCity: city,
      websiteContent: {
        h1: h1Text || keyword, 
        titleTag: titleTag || `${keyword} in ${city}`,
        metaDescription: ''
      },
      backlinks: 'medium'
    };
    onRunAudit(selectedPlace, inputs);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">GBP Audit & Fix Tool</h2>
        <p className="opacity-90">Enter your business details to generate a 100-point ranking score.</p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Business Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Find Business on Maps</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input
                id="business-search-input"
                type="text"
                disabled={!mapsApiKey && !selectedPlace}
                placeholder={mapsApiKey || selectedPlace ? "Start typing business name..." : "System is waiting for configuration..."}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all outline-none
                  ${!mapsApiKey && !selectedPlace 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                value={searchValue}
                onChange={handleSearchChange}
              />
              {isLoading && <div className="absolute right-3 top-3.5"><Loader2 className="w-5 h-5 animate-spin text-blue-500"/></div>}
            </div>
            
            {/* API Error Message */}
            {searchError && (
              <div className="mt-2 text-xs p-2 bg-red-50 text-red-600 border border-red-200 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
            
            {/* Predictions Dropdown */}
            {predictions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {predictions.map((pred) => (
                  <div
                    key={pred.place_id}
                    onClick={() => handleSelectPrediction(pred.place_id, pred.description)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 mt-1 text-slate-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{pred.structured_formatting.main_text}</div>
                      <div className="text-xs text-slate-500">{pred.structured_formatting.secondary_text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedPlace && (
              <div className="mt-2 p-3 bg-green-50 text-green-700 text-sm rounded flex items-center gap-2 border border-green-100 animate-in fade-in slide-in-from-top-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Selected: <strong>{selectedPlace.name}</strong> ({selectedPlace.rating}★)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Dentist"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Website Data (Manual Entry for Demo) */}
          <div className="pt-2">
             <button 
               type="button" 
               className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 mb-3"
               onClick={() => setShowAdvanced(!showAdvanced)}
             >
               {showAdvanced ? 'Hide Website Details' : '+ Add Website Details (for higher score accuracy)'}
             </button>
             
             {showAdvanced && (
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                 <div className="flex gap-2 items-center text-sm text-slate-500 mb-2">
                   <Globe className="w-4 h-4" /> Website SEO Data
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Homepage H1 Tag</label>
                    <input 
                      type="text" 
                      placeholder="Copy the main heading from homepage" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm"
                      value={h1Text}
                      onChange={(e) => setH1Text(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Meta Title Tag</label>
                    <input 
                      type="text" 
                      placeholder="Copy the browser tab title" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm"
                      value={titleTag}
                      onChange={(e) => setTitleTag(e.target.value)}
                    />
                 </div>
               </div>
             )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
              ${isLoading 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Analyzing Profile...
              </>
            ) : !selectedPlace ? (
              <>
                Select a Business above to Start <ArrowRight className="w-5 h-5 opacity-50" />
              </>
            ) : (
              <>
                Run Full Audit <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-slate-400">
            Powered by ProRank Neural Engine. 
            <br/>Safe analysis. No data modification.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuditForm;