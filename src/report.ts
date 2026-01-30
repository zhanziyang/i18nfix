import { Issue, Report } from './types.js';

export function makeEmptyReport(base: string, targets: string[]): Report {
  return {
    base,
    targets,
    issues: [],
    summary: {
      missingKeys: 0,
      extraKeys: 0,
      emptyValues: 0,
      untranslated: 0,
      placeholderMismatches: 0,
      parseErrors: 0,
    },
  };
}

export function addIssue(report: Report, issue: Issue) {
  report.issues.push(issue);
  switch (issue.type) {
    case 'missing_key':
      report.summary.missingKeys++;
      break;
    case 'extra_key':
      report.summary.extraKeys++;
      break;
    case 'empty_value':
      report.summary.emptyValues++;
      break;
    case 'untranslated':
      report.summary.untranslated++;
      break;
    case 'placeholder_mismatch':
      report.summary.placeholderMismatches++;
      break;
    case 'parse_error':
      report.summary.parseErrors++;
      break;
  }
}
