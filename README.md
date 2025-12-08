# F1 Historical Stats Dashboard

This is a [Next.js](https://nextjs.org) project for exploring and analyzing F1 race results and championship standings. The application is being built with TypeScript and features interactive components for session and standings selection.

**NOTE: This dashboard is limited to historical data and does not provide live updates (see Known Issues & Limitations section).

## Project Progress

So far, the following has been implemented:

- **Session Selection**: Users can filter sessions by year, track, and session type via a custom dropdown component.
- **Session Information**: Users are displayed the filtered information based on their session selection—the default value is the latest session available.
- **Weather Information**: Users are displayed weather and temperature averages of the selected session.
- **Session Results**: Users can view the final positions and results of each driver from the selected session. 
- **Championship standings**: Users can toggle between Constructors and Drivers standings to view results up to that session's date.
- **Pace Chart**: Users can view pace during a pace session of each selected driver from the selected session.
- **Stints Chart**: Users can view tires used and tire stints of each selected driver from the selected session.
- **Session Summary**: Users can view an AI-generated summary of the selected session.
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

## Known Issues & Limitations

- The OpenF1 API does not offer free live data as it requires a paid account to do so. The website will experience downtime during times that match up with live F1 events such as practices, qualifiers, and races.
- Rate limiting is a big issue with both the API I am using and the OpenRouter chat model being used. This will be address in the future as I am focusing on completing the dashboard components as of Nov. 2025.
- The Login/Register function serves no purpose as of Nov. 2025—it is merely there for implementation sake but I do plan to use it in the future.
- Specific API endpoints are still in beta (i.e., Session Result, Starting Grid), so some of the components may end up breaking as the OpenF1 devs continue to work.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [F1 API docs](https://openf1.org/)
- [Jira KAN board](https://kentq6.atlassian.net/jira/software/projects/KAN/boards/1)

## Deployment

The project is set up for easy deployment on [Vercel](https://vercel.com/). See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

