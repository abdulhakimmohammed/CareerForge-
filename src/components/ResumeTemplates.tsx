/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeData } from "../types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Award, CheckCircle } from "lucide-react";

interface ResumeTemplatesProps {
  data: ResumeData;
  activeView: "desktop" | "tablet" | "print";
}

export default function ResumeTemplates({ data, activeView }: ResumeTemplatesProps) {
  const {
    personalInfo,
    professionalSummary,
    workExperience,
    education,
    projects,
    skills,
    languages,
    certifications,
    awards,
    volunteerExperience,
    references,
    template,
  } = data;

  const wrapperClasses = {
    desktop: "w-full max-w-[800px] aspect-[1/1.41] shadow-xl p-8 sm:p-12 border",
    tablet: "w-full max-w-[600px] aspect-[1/1.41] shadow-md p-6 sm:p-8 border",
    print: "w-full print-page p-0 border-0 shadow-none",
  }[activeView];

  // Template Theme Colors
  const colors = {
    modern: {
      bg: "bg-white",
      text: "text-slate-800",
      accent: "text-emerald-600",
      accentBg: "bg-emerald-50",
      border: "border-emerald-500",
      heading: "text-slate-900 font-display",
    },
    executive: {
      bg: "bg-white",
      text: "text-slate-800",
      accent: "text-indigo-900",
      accentBg: "bg-indigo-50",
      border: "border-indigo-900",
      heading: "text-indigo-950 font-display font-bold uppercase tracking-wider",
    },
    creative: {
      bg: "bg-white",
      text: "text-slate-800",
      accent: "text-violet-600",
      accentBg: "bg-violet-50/60",
      border: "border-pink-500",
      heading: "text-slate-900 font-display font-extrabold tracking-tight",
    },
    minimal: {
      bg: "bg-white",
      text: "text-slate-800",
      accent: "text-slate-900",
      accentBg: "bg-slate-100",
      border: "border-slate-900",
      heading: "text-slate-950 font-sans font-medium tracking-tight",
    },
    classic: {
      bg: "bg-white",
      text: "text-slate-900 font-serif",
      accent: "text-amber-800",
      accentBg: "bg-amber-50/50",
      border: "border-amber-800",
      heading: "text-amber-950 font-serif font-bold",
    },
  }[template || "modern"];

  return (
    <div
      id="cv-template-preview"
      className={`mx-auto transition-all bg-white text-slate-800 ${wrapperClasses} ${colors.bg} ${colors.text} print:p-0`}
    >
      {/* 1. Header Section */}
      {template === "classic" ? (
        <div className="text-center border-b-2 border-slate-300 pb-5 mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">{personalInfo.fullName || "Your Full Name"}</h1>
          <p className="text-sm italic font-medium text-amber-800 mb-3">{personalInfo.profession || "Your Profession"}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 font-mono">
            {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {personalInfo.phone}</span>}
            {personalInfo.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {personalInfo.address}</span>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono mt-1.5">
            {personalInfo.linkedIn && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {personalInfo.linkedIn}</span>}
            {personalInfo.gitHub && <span className="flex items-center gap-1"><Github className="w-3 h-3" /> {personalInfo.gitHub}</span>}
            {personalInfo.portfolio && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {personalInfo.portfolio}</span>}
          </div>
        </div>
      ) : template === "executive" ? (
        <div className="border-l-4 border-indigo-900 pl-6 py-2 mb-8 bg-slate-50 p-4 rounded-r-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-950 uppercase">{personalInfo.fullName || "Your Full Name"}</h1>
          <p className="text-sm font-semibold text-indigo-800 tracking-widest uppercase mt-0.5">{personalInfo.profession || "Your Profession"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs text-slate-600 font-mono">
            {personalInfo.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-900" /> {personalInfo.email}</div>}
            {personalInfo.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-900" /> {personalInfo.phone}</div>}
            {personalInfo.address && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-900" /> {personalInfo.address}</div>}
            {personalInfo.linkedIn && <div className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-indigo-900" /> {personalInfo.linkedIn}</div>}
            {personalInfo.gitHub && <div className="flex items-center gap-1.5"><Github className="w-3.5 h-3.5 text-indigo-900" /> {personalInfo.gitHub}</div>}
            {personalInfo.portfolio && <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-indigo-900" /> {personalInfo.portfolio}</div>}
          </div>
        </div>
      ) : template === "creative" ? (
        <div className="mb-8 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-violet-400 to-pink-400 rounded-full blur-2xl opacity-30" />
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <p className="text-base font-semibold text-slate-600 mt-1">{personalInfo.profession || "Your Profession"}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-mono text-slate-500">
            {personalInfo.email && <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-violet-500" /> {personalInfo.email}</span>}
            {personalInfo.phone && <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-violet-500" /> {personalInfo.phone}</span>}
            {personalInfo.address && <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-violet-500" /> {personalInfo.address}</span>}
            {personalInfo.linkedIn && <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1"><Linkedin className="w-3.5 h-3.5 text-violet-500" /> {personalInfo.linkedIn}</span>}
          </div>
        </div>
      ) : template === "minimal" ? (
        <div className="border-b border-slate-200 pb-5 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{personalInfo.fullName || "Your Full Name"}</h1>
          <p className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">{personalInfo.profession || "Your Profession"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.address && <span>• {personalInfo.address}</span>}
            {personalInfo.linkedIn && <span>• LinkedIn</span>}
            {personalInfo.gitHub && <span>• GitHub</span>}
          </div>
        </div>
      ) : (
        // Modern default template
        <div className="border-b-4 border-emerald-500 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{personalInfo.fullName || "Your Full Name"}</h1>
            <p className="text-sm font-semibold text-emerald-600 font-display tracking-wide mt-0.5">{personalInfo.profession || "Your Profession"}</p>
          </div>
          <div className="text-xs text-slate-600 space-y-1 text-left sm:text-right font-mono">
            {personalInfo.email && <div className="flex items-center sm:justify-end gap-1"><Mail className="w-3.5 h-3.5 text-emerald-600" /> {personalInfo.email}</div>}
            {personalInfo.phone && <div className="flex items-center sm:justify-end gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {personalInfo.phone}</div>}
            {personalInfo.address && <div className="flex items-center sm:justify-end gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {personalInfo.address}</div>}
            <div className="flex flex-wrap gap-2 pt-1 sm:justify-end">
              {personalInfo.linkedIn && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">LN</span>}
              {personalInfo.gitHub && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">GH</span>}
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Summary */}
      {professionalSummary && (
        <div className="mb-6">
          <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-2.5 ${colors.accent}`}>
            Professional Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-600">{professionalSummary}</p>
        </div>
      )}

      {/* Grid of details for layout space saving */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Experience & Projects (Main left side) */}
        <div className="md:col-span-8 space-y-6">
          {/* Work Experience */}
          {workExperience && workExperience.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-4.5 ${colors.accent}`}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {workExperience.map((job) => (
                  <div key={job.id} className="relative pl-1">
                    <div className="flex justify-between items-start flex-wrap mb-1">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{job.position}</h3>
                        <p className={`text-xs font-semibold ${colors.accent}`}>{job.company} <span className="text-slate-400 font-normal">| {job.location}</span></p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        {job.startDate} - {job.current ? "Present" : job.endDate}
                      </span>
                    </div>
                    {/* Preserve line breaks or render bullet lists */}
                    <div className="text-xs text-slate-600 space-y-1.5 mt-2 pl-1 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-4.5 ${colors.accent}`}>
                Key Projects
              </h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="pl-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                      {proj.technologies && (
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {proj.technologies}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 mb-1">{proj.role}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column of skills, education, Certifications */}
        <div className="md:col-span-4 space-y-6 border-l border-slate-100 pl-0 md:pl-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-3 ${colors.accent}`}>
                Core Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-3.5 ${colors.accent}`}>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-left">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{edu.degree}</h3>
                    <p className="text-[11px] font-medium text-slate-600">{edu.fieldOfStudy}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{edu.institution} | {edu.location}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{edu.startDate} - {edu.endDate}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-3.5 ${colors.accent}`}>
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id} className="text-left text-xs text-slate-600">
                    <p className="font-bold text-slate-900">{cert.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{cert.issuer} ({cert.date})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-3 ${colors.accent}`}>
                Languages
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {languages.map((lang) => (
                  <div key={lang.id}>
                    <p className="font-bold text-slate-900">{lang.name}</p>
                    <p className="text-[10px] text-slate-500">{lang.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {awards && awards.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-3 ${colors.accent}`}>
                Awards
              </h2>
              <div className="space-y-2">
                {awards.map((award) => (
                  <div key={award.id} className="text-xs text-slate-600">
                    <p className="font-bold text-slate-900">{award.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{award.issuer} • {award.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold tracking-wider uppercase border-b border-slate-100 pb-1.5 mb-3 ${colors.accent}`}>
                References
              </h2>
              <div className="space-y-2">
                {references.map((ref) => (
                  <div key={ref.id} className="text-xs text-slate-600">
                    <p className="font-bold text-slate-900">{ref.name}</p>
                    <p className="text-[10px] text-slate-500">{ref.relationship} ({ref.company})</p>
                    <p className="text-[10px] text-slate-400 font-mono">{ref.email} | {ref.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
