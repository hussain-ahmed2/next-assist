import { getMemberAvailableCourses } from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, GraduationCap, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function CourseCatalogPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const courses = await getMemberAvailableCourses();

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-12 border border-primary/10">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-black">
            Member Discovery
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none">
            Unlock New <span className="text-primary italic">Capabilities.</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Explored our curated catalog of enterprise-grade courses. Designed by experts, tailored for your organization.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input 
                placeholder="Search courses, skills, or experts..." 
                className="pl-12 h-14 rounded-2xl border-border bg-background shadow-xl shadow-primary/5 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
            <GraduationCap className="size-96 -mr-20 -mt-20 text-primary" />
        </div>
      </div>

      {/* Course Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Star className="size-6 text-yellow-500 fill-yellow-500" />
                Featured Curriculum
            </h2>
            <div className="flex gap-2">
                {/* Filter chips? */}
                <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-muted font-bold">All</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 cursor-pointer hover:bg-muted font-bold">Business</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 cursor-pointer hover:bg-muted font-bold">Design</Badge>
            </div>
        </div>

        {courses.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed">
                <BookOpen className="size-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold">No published courses available</h3>
                <p className="text-muted-foreground">Check back later for new content.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <Card key={course.id} className="group border-border/60 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 rounded-3xl overflow-hidden flex flex-col">
                        <div className="aspect-video bg-muted/40 relative flex items-center justify-center overflow-hidden">
                             <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent group-hover:scale-110 transition-transform duration-700" />
                             <BookOpen className="size-16 text-primary/20 relative z-10" />
                        </div>
                        <CardHeader className="pt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary border-primary/10">
                                    Learning Path
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    {new Date(course.createdAt).getFullYear()}
                                </span>
                            </div>
                            <CardTitle className="text-xl font-black tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                {course.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {course.description || "Embark on a transformative journey with this comprehensive curriculum designed for modern professionals."}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-0 pb-6 px-6">
                            <Button asChild className="w-full rounded-2xl h-12 gap-2 shadow-lg shadow-primary/20 group-hover:bg-primary group-hover:scale-[1.02] transition-all">
                                <Link href={`/learn/courses/${course.id}`}>
                                    Begin Learning <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
