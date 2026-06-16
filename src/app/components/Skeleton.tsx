// Shimmer skeletons shaped like the real content, so loading feels seamless.

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={`skeleton block ${className}`} style={style} aria-hidden />;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card border border-border rounded-2xl overflow-hidden">{children}</div>;
}

export function SummarySkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="w-[30px] h-[30px] rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-12" />
          <div className="flex items-center gap-2 flex-1 flex-row-reverse">
            <Skeleton className="w-[30px] h-[30px] rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex flex-col items-center gap-1.5 py-3 ${i === 1 ? "border-x border-border" : ""}`}>
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RowList({ rows, children }: { rows: number; children: (i: number) => React.ReactNode }) {
  return (
    <Card>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={i > 0 ? "border-t border-border" : ""}>
          {children(i)}
        </div>
      ))}
    </Card>
  );
}

export function FixtureListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-14 rounded-2xl shrink-0" />
        ))}
      </div>
      {[0, 1].map((s) => (
        <div key={s} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <RowList rows={3}>
            {() => (
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-4 w-9" />
                <div className="w-px self-stretch bg-border" />
                <div className="flex-1 flex flex-col gap-2">
                  {[0, 1].map((r) => (
                    <div key={r} className="flex items-center gap-3">
                      <Skeleton className="w-7 h-7 rounded-md" />
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </RowList>
        </div>
      ))}
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[0, 1].map((g) => (
        <div key={g} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <RowList rows={4}>
            {() => (
              <div className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-3.5 w-24 flex-1" />
                <Skeleton className="h-3.5 w-6" />
              </div>
            )}
          </RowList>
        </div>
      ))}
    </div>
  );
}

export function BracketSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[0, 1].map((r) => (
        <div key={r} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <RowList rows={3}>
            {() => (
              <div className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="h-8 w-10" />
                <div className="w-px self-stretch bg-border" />
                <div className="flex-1 flex flex-col gap-2">
                  {[0, 1].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <Skeleton className="w-6 h-6 rounded-md" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </RowList>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <RowList rows={8}>
      {() => (
        <div className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="h-4 w-5" />
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="h-3.5 w-32 flex-1" />
          <Skeleton className="h-4 w-6" />
        </div>
      )}
    </RowList>
  );
}

export function MatchDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-4 pb-8">
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-3">
        <div className="flex-1 flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-md" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <Skeleton className="h-8 w-16" />
        <div className="flex-1 flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-md" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>
      <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: "10 / 16" }} />
    </div>
  );
}
