import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faLink, faShareAlt } from '@fortawesome/free-solid-svg-icons';

interface SocialShareBarProps {
  url?: string;
  title?: string;
}

const SocialShareBar: React.FC<SocialShareBarProps> = ({ 
  url = window.location.href,
  title = 'Check out AuteurEye!'
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div 
      className="fixed bottom-24 right-6 z-50 hidden md:block"
      initial={false}
      animate={{ scale: isExpanded ? 1 : 0.95 }}
    >
      <div className="backdrop-blur-md bg-auteur-bg-card/80 rounded-2xl shadow-lg border border-auteur-neutral/10 overflow-hidden flex flex-col items-center">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 hover:bg-white/10 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faShareAlt} className="text-auteur-primary" size="lg" />
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2 pb-3"
            >
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTwitter} className="text-auteur-primary" size="lg" />
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faFacebookF} className="text-auteur-primary" size="lg" />
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="text-auteur-primary" size="lg" />
              </a>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faLink} className="text-auteur-primary" size="lg" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SocialShareBar; 