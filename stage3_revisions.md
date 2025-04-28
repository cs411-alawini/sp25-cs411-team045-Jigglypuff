# Stage 3 Revisions

This document summarizes changes made in Stage 3 to address feedback from the original submission.

## 1. Added Foreign Key Relationships in DDL Commands
**Comment Addressed**: “-2: Missing FK relationships in DDL commands (ex: movie_location table should contain FK to movie table)”

- **Original Submission**: The DDL for `movie_location` and `flight` tables did not declare foreign key constraints, which risked data integrity issues.
- **Revision**: Updated the DDL to include:
  - `movie_location` table: `FOREIGN KEY (Movie) REFERENCES movie(Title) ON DELETE SET NULL` 
  - `flight` table:
    - `FOREIGN KEY (Origin) REFERENCES airport(Code) ON DELETE CASCADE`
    - `FOREIGN KEY (Dest)   REFERENCES airport(Code) ON DELETE CASCADE` 

These additions enforce referential integrity between movies, airports, and flight records.

## 2. Clarified Final Indexing Design
**Comment Addressed**: “-1: Indexing analysis for each index is provided, however the final indexing design for each query is not discussed”

- **Original Submission**: We presented index experiments and their measured costs for each advanced query but did not state which index configuration was chosen as the final design or justify why.
- **Revision**: We select the final index design for each advanced query.

