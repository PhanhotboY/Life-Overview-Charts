import { useEffect } from 'react';

export default function GithubProfile() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/gh/PhanhotboY/profile-card@1.0.1/jsdelivr/widget.js';
    script.type = 'module';

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
    // setIsLoaded(true);
  }, []);

  return (
    <div className='github'>
      <div
        id='github-card'
        data-user='PhanhotboY'
        data-height='150px'
        data-width='350px'
      ></div>

      <img
        src='https://github-readme-streak-stats.herokuapp.com?user=PhanhotboY&theme=dark&hide_border=true'
        width='350'
        alt='GitHub Streak Stats'
        loading='lazy'
      />

      <img
        src='https://github-readme-stats.vercel.app/api?username=PhanhotboY&show_icons=true&theme=bear'
        width='350'
        alt='GitHub Stats'
        loading='lazy'
      />
    </div>
  );
}
