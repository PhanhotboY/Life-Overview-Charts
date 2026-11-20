import { useEffect } from "react";

export default function GithubProfile() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/PhanhotboY/profile-card@1.0.1/jsdelivr/widget.js";
    script.type = "module";

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
    // setIsLoaded(true);
  }, []);

  return (
    <div className="github">
      <div
        id="github-card"
        data-user="phannd353"
        data-height="150px"
        data-width="350px"
      ></div>

      <img
        src="https://github-readme-streak-stats.herokuapp.com?user=phannd353&theme=dark&hide_border=true"
        width="350"
        alt="GitHub Streak Stats"
        loading="lazy"
      />

      <img
        src="https://github-stats-extended.vercel.app/api?username=phannd353&show_icons=true&show=contributions,reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_reviewed,issues_commented&theme=dark_github"
        width="350"
        alt="GitHub Stats"
        loading="lazy"
      />
    </div>
  );
}
