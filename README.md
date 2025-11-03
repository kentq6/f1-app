# F1 Historical Stats Dashboard

This is a [Next.js](https://nextjs.org) project for exploring and analyzing F1 race results and championship standings. The application is being built with TypeScript and features interactive components for session and standings selection.

**NOTE: It is notable that this uses the free version of an open-source API, which is limited to historical data and does not provide live updates.

## Project Progress

So far, the following has been implemented:

- **Session Selection**: Users can filter sessions by year, track, and session type via a custom dropdown component.
- **Session Information**: Users are displayed the filtered information based on their session selection—the default value is the latest session available.
- **Weather Information**: Users are displayed weather and temperature averages of the selected session.
- **Session Results**: Users can view the position, laps completed, final times, and amount of points (if applicable) of each driver from the selected session. 
- **Starting Grid**: Users can view the positions, lap duration, and gap to leader of each driver from the selected session.
- **Stint Chart**: Users can view tires used and tire stints of each selected driver from the selected session.
- **Championship standings**: Users can toggle between Constructors and Drivers standings to view results up to that session's date.
- **Shadcn/ui integration**: Utilizing [shadcn/ui](https://ui.shadcn.com/) components for high-quality design elements.
- **ClerkJS integration**: Utilizing [Clerk](https://clerk.com/) components for user authentication (planning to implement user-specific features in the near future).

The project is under active development. See the [KAN board on Jira](https://kentq6.atlassian.net/jira/software/projects/KAN/boards/1) for progress, TODOs, and issues.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the current progress.

## Development Notes

- Core editing is taking place in the `components/` and `app/` directories.
- The UI and functionality are subject to frequent updates as features are being flushed out.
- The focus is currently on championship standings selection, table rendering, and robust state management.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [F1 API docs](https://openf1.org/)
- [Jira KAN board](https://kentq6.atlassian.net/jira/software/projects/KAN/boards/1)

## Deployment

The project is set up for easy deployment on [Vercel](https://vercel.com/). See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

