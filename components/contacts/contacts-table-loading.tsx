"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactsTableLoading() {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0.3 },
    show: { opacity: 0.7 },
  };

  // Shimmer effect component
  const ShimmerSkeleton = ({ className, ...props }: { className?: string }) => (
    <div className="relative overflow-hidden">
      <Skeleton className={`${className} bg-neutral-800`} {...props} />
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
        animate={{
          x: ["calc(-100%)", "calc(100%)"],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  );

  return (
    <div className="w-full h-full border border-neutral-800 mx-auto bg-neutral-950 rounded-xl overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
        <ShimmerSkeleton className="h-8 w-48 mb-4" />
        <ShimmerSkeleton className="h-10 w-full" />
      </div>
      <div className="overflow-y-auto h-[calc(100%-120px)]">
        <Table>
          <TableHeader className="bg-neutral-900">
            <TableRow className="border-b border-neutral-800">
              <TableHead>
                <ShimmerSkeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <ShimmerSkeleton className="h-4 w-24" />
              </TableHead>
              <TableHead className="text-right">
                <ShimmerSkeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[...Array(5)].map((_, i) => (
              <motion.tr
                key={`loading-${i}`}
                variants={itemVariants}
                className="border-b border-neutral-800"
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 1.5,
                  delay: i * 0.1,
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ShimmerSkeleton className="h-8 w-8 rounded-full" />
                    <ShimmerSkeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <ShimmerSkeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="text-right">
                  <ShimmerSkeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </motion.tr>
            ))}
          </motion.tbody>
        </Table>
      </div>
    </div>
  );
}
