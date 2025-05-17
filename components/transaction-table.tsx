"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon, CheckIcon, CopyIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

// Define the data types
interface Participant {
  email: string
  wallet_address: string
}

interface Transaction {
  id: string
  created_at: string
  from: Participant
  to: Participant
  transaction_hash: string | null
  block_number: number | null
  transaction_type: string | null
}

type TransactionTableProps = {
  transactionsSent: Transaction[]
  transactionsReceived: Transaction[]
}

export default function TransactionTable({ transactionsSent, transactionsReceived }: TransactionTableProps) {
  const [filter, setFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const itemsPerPage = 10

  // Filter transactions based on selected filter
  const filteredTransactions = [...transactionsSent, ...transactionsReceived]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((transaction) => {
      if (filter === "All") return true
      if (filter === "Received") return transaction.transaction_type === "receive"
      if (filter === "Sent") return transaction.transaction_type === "send"
      if (filter === "Swap") return transaction.transaction_type === "swap"
      return true
    })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // Count transactions by type
  const allCount = transactionsSent.length + transactionsReceived.length
  const receivedCount = transactionsReceived.length
  const sentCount = transactionsSent.length
  const swapCount = transactionsSent.filter((t) => t.transaction_type === "swap").length

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncate = (str: string, length = 8) => {
    if (!str) return ""
    if (str.length <= length) return str
    return `${str.substring(0, length)}...${str.substring(str.length - 4)}`
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.transaction_type === "receive") {
      return <ArrowDownIcon className="h-5 w-5 text-green-400" />
    } else if (transaction.transaction_type === "send") {
      return <ArrowUpIcon className="h-5 w-5 text-red-400" />
    } else if (transaction.transaction_type === "swap") {
      return <RefreshCwIcon className="h-5 w-5 text-purple-400" />
    } else {
      return <RefreshCwIcon className="h-5 w-5 text-blue-400" />
    }
  }

  const getTransactionTypeLabel = (transaction: Transaction) => {
    if (transaction.transaction_type === "receive") {
      return "Received"
    } else if (transaction.transaction_type === "send") {
      return "Sent"
    } else if (transaction.transaction_type === "swap") {
      return "Swap"
    } else {
      return "Transfer"
    }
  }

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.transaction_type === "receive") {
      return `Received from ${transaction.from.email}`
    } else if (transaction.transaction_type === "send") {
      return `Sent to ${transaction.to.email}`
    } else if (transaction.transaction_type === "swap") {
      return `Swapped with ${transaction.to.email}`
    } else {
      return `Transfer to ${transaction.to.email}`
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedHash(text)
      toast.success("Transaction hash copied to clipboard")
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (err) {
      console.error(err)
      toast.error("Failed to copy transaction hash")
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto text-neutral-100">
      <Card className="bg-neutral-900/70 backdrop-blur-md shadow-xl border-neutral-700">
        <div className="py-8">
          {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-neutral-800 border-neutral-600 text-neutral-200">
                  {dateRange} <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                <DropdownMenuItem onClick={() => setDateRange("Last 7 days")}>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("Last 30 days")}>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("Last 90 days")}>Last 90 days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="bg-neutral-800 border-neutral-600 text-neutral-200">
              <CalendarIcon className="mr-2 h-4 w-4" />
              15 May - 22 May
            </Button>
          </div> */}

          <Tabs defaultValue="All" className="mb-6">
            <TabsList className="bg-neutral-800 ml-3">
              <TabsTrigger
                value="All"
                onClick={() => setFilter("All")}
                className={cn("data-[state=active]:bg-neutral-700", filter === "All" ? "text-white" : "text-neutral-400")}
              >
                All <Badge className="ml-2 bg-neutral-600 text-neutral-200">{allCount}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="Received"
                onClick={() => setFilter("Received")}
                className={cn(
                  "data-[state=active]:bg-neutral-600",
                  filter === "Received" ? "text-white" : "text-neutral-400",
                )}
              >
                Received <Badge className="ml-2 bg-neutral-600 text-neutral-200">{receivedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="Sent"
                onClick={() => setFilter("Sent")}
                className={cn("data-[state=active]:bg-neutral-600", filter === "Sent" ? "text-white" : "text-neutral-400")}
              >
                Sent <Badge className="ml-2 bg-neutral-600 text-neutral-200">{sentCount}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="Swap"
                onClick={() => setFilter("Swap")}
                className={cn("data-[state=active]:bg-neutral-600", filter === "Swap" ? "text-white" : "text-neutral-400")}
              >
                Swap <Badge className="ml-2 bg-neutral-600 text-neutral-200">{swapCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="overflow-x-auto">
            <div className="min-h-[530px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-neutral-800 sticky top-0 z-10">
                  <TableRow className="border-neutral-700">
                    <TableHead className="w-36">Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-neutral-700/50 border-neutral-700">
                      <TableCell className="w-36">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-700">
                            {getTransactionIcon(transaction)}
                          </div>
                          <span className="ml-3">{getTransactionTypeLabel(transaction)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(transaction.created_at)}</TableCell>
                      <TableCell className="whitespace-nowrap">{transaction.from.email}</TableCell>
                      <TableCell>
                        {transaction.transaction_hash ? (
                          <div className="flex items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "font-mono text-xs border-transparent text-neutral-300 cursor-pointer hover:bg-neutral-800",
                                      copiedHash === transaction.transaction_hash && "bg-neutral-800"
                                    )}
                                    onClick={() => copyToClipboard(transaction.transaction_hash!)}
                                  >
                                    {copiedHash === transaction.transaction_hash ? (
                                      <CheckIcon className="h-3 w-3 mr-1" />
                                    ) : (
                                      <CopyIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {truncate(transaction.transaction_hash, 12)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-neutral-700 border-neutral-600 text-neutral-200">
                                  <p className="font-mono text-xs">{transaction.transaction_hash}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                            No Hash
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{getTransactionDescription(transaction)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-neutral-800 border-neutral-700 text-neutral-200"
              >
                Previous
              </Button>
              <span className="text-neutral-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-neutral-800 border-neutral-700 text-neutral-200"
              >
                Next
              </Button>
            </div>
            <div className="text-neutral-400 text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
