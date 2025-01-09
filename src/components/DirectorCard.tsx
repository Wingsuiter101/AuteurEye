// src/components/DirectorCard.tsx
import { Link } from 'react-router-dom';

interface Movie {
  title: string;
  year: string;
}

interface DirectorCardProps {
  id: number;
  name: string;
  profilePath: string | null;
  knownFor: Movie[];
}

const DirectorCard = ({ id, name, profilePath, knownFor }: DirectorCardProps) => {
  return (
    <Link 
      to={`/director/${id}`}
      className="group flex flex-col bg-auteur-bg-card rounded-card shadow-card 
                hover:shadow-card-hover overflow-hidden transition-all duration-200 
                hover:scale-105 animate-fade-in"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-auteur-neutral-light">
        {profilePath ? (
          <img
            src={profilePath}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl 
                         font-display text-auteur-primary-light bg-auteur-bg-dark">
            {name.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="p-card flex-1">
        <h3 className="text-xl font-display font-bold mb-2 text-auteur-primary 
                     group-hover:text-auteur-accent transition-colors duration-200">
          {name}
        </h3>
        <div className="space-y-1">
          {knownFor.map((movie) => (
            <p key={movie.title} className="text-sm text-auteur-neutral-dark">
              {movie.title} ({movie.year})
            </p>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default DirectorCard;