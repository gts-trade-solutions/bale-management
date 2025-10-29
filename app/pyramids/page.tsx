"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { pyramidOccupancy } from "@/lib/selectors";
import { Eye } from "lucide-react";

export default function PyramidsPage() {
  const pyramids = useStore((state) => state.pyramids);
  const slots = useStore((state) => state.slots);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pyramids</h1>
        <p className="text-muted-foreground">Storage pyramid overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pyramids.map((pyramid) => {
          const occupancy = pyramidOccupancy(pyramid, slots);
          return (
            <Card key={pyramid.pyramidId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{pyramid.pyramidId}</CardTitle>
                  <Badge
                    className={
                      pyramid.qualityGrade === "A"
                        ? "bg-green-600"
                        : "bg-amber-600"
                    }
                  >
                    Grade {pyramid.qualityGrade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Occupancy</span>
                    <span className="font-medium">{occupancy.toFixed(0)}%</span>
                  </div>
                  <Progress value={occupancy} />
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Zone:</span> {pyramid.zone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Capacity:</span>{" "}
                    {pyramid.capacity} bales
                  </p>
                  <p>
                    <span className="text-muted-foreground">Shape:</span>{" "}
                    {pyramid.shape.x}×{pyramid.shape.y}×{pyramid.shape.z}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge variant={pyramid.status === "Active" ? "default" : "secondary"}>
                      {pyramid.status}
                    </Badge>
                  </p>
                </div>

                <Link href={`/pyramids/${pyramid.pyramidId}`}>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
