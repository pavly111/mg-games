# MG Games

## Overview

MG Games is a modern web application designed as a digital archive and community-sharing platform for games and activities. The project helps users browse, discover, and contribute game ideas that can be used for different situations such as indoor activities, outdoor games, puzzle challenges, and team-building experiences.

The application acts as a centralized library of games where people can search for an idea, view instructions, check materials needed, and explore optional visual or audio guides. It is a practical tool for communities, event organizers, teachers, team leaders, and anyone who wants to quickly find engaging activities.

---

## Project Purpose

The main goal of MG Games is to make game sharing simple and organized. Instead of keeping game ideas in scattered notes or messages, users can save them in a structured archive with clear categories and detailed descriptions.

The app supports:

- Browsing a large collection of games
- Searching for specific games by name or description
- Filtering by category
- Viewing full instructions for each game
- Adding new games to the archive
- Managing and editing game records
- Uploading photos and voice notes for better game explanations

---

## Key Features

### 1. Game Browsing Homepage
The homepage displays all games in a clean card-based layout. Each card presents a summary of the game, and users can filter by category or search for specific terms.

Categories include:

- Puzzle
- Team Game
- Outdoor
- Indoor

This makes it easy to find content that matches a specific setting or purpose.

### 2. Detailed Game Page
Each game has its own detailed view where users can access:

- Game name
- Category
- Date added
- Added by person
- How the game is played
- Required materials
- Photo of the game or activity
- Voice guide if provided

This creates a full understanding of the activity before trying it.

### 3. Add New Game Form
Users can submit new activities by filling out a form with the following fields:

- Game name
- Description
- Category
- Materials needed
- Contributor name
- Optional image
- Optional voice note

This allows the archive to grow organically from user contributions.

### 4. Image Upload Support
The app allows users to upload an image for each game. Media is handled through Cloudinary, which keeps the application lightweight while providing cloud-based file storage.

This helps make game entries more visual and easier to understand.

### 5. Voice Recording and Upload
The platform supports recording a voice note directly in the browser and uploading it as an audio file. This is useful when a game explanation is easier to share by voice rather than only text.

Users can:

- Start recording
- Stop recording
- Preview the recorded audio
- Upload it to the project storage

### 6. Admin Access and Management
A protected admin section is included for managing the content. The admin can log in using a password stored in the environment configuration. Once authenticated, they can:

- View the games list
- Delete games
- Maintain the archive

This helps keep the platform controlled and ensures that only trusted users can manage content.

### 7. Edit Game Functionality
The admin has the ability to edit game entries after they are added. This includes updating:

- Basic information
- Description
- Category
- Materials
- Images
- Voice notes

This makes the platform flexible and suitable for long-term use.

---

## Tech Stack

MG Games is built using a modern frontend stack:

- React.js for the user interface
- Vite for project setup and development
- React Router for navigation between pages
- Firebase Firestore for storing game data
- Cloudinary for image and audio uploads
- JavaScript for application logic

---

## Project Structure

The project is organized into a small, clean structure:

- App entry and router configuration
- Home page for browsing games
- Game detail page for viewing a single game
- Add Game page for submission
- Admin page for moderation and management
- Firebase configuration file
- Shared UI components such as navigation and cards

This structure is simple, easy to follow, and suitable for a small-to-medium community app.

---

## Data Flow

The application uses Firebase Firestore as its database. When the app loads, it queries the games collection, sorts entries by creation date, and displays them in the UI.

When a user adds a new game:

1. The form data is collected.
2. Media uploads are processed if provided.
3. A new document is created in Firestore.
4. The user is redirected back to the home archive.

When the admin deletes or updates a game, the Firestore collection is updated immediately, and the app reflects the new state in real time.

---

## User Experience

The app is intended to be simple, highly usable, and visually organized. Users can quickly:

- Search a game idea
- Check whether it fits a category
- Read the instructions
- Understand the needed materials
- View helpful media

The overall experience is optimized for convenience and accessibility, especially for people who need immediate access to activity ideas.

---

## Summary

MG Games is a game archive and community-driven activity platform that allows users to discover, contribute, and manage games with clear instructions, categories, and media support. It combines React, Firebase, and Cloudinary to create a practical, searchable, and easy-to-use archive for game lovers and organizers.

The project is especially useful for anyone who wants to build a structured collection of games and activity ideas in one place.
