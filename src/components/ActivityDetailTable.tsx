'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity } from '@/lib/types';
import StatusBadge from '@/components/dashboard/status-badge';
import { FileText, FileWarning, CheckCircle2 } from 'lucide-react';

interface ActivityDetailTableProps {
  data: Activity[];
}

export default function ActivityDetailTable({ data }: ActivityDetailTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[100px] text-[10px] font-bold uppercase text-gray-500">ID</TableHead>
            <TableHead className="text-[10px] font-bold uppercase text-gray-500">Activity & Partner</TableHead>
            <TableHead className="text-[10px] font-bold uppercase text-gray-500">Location</TableHead>
            <TableHead className="text-[10px] font-bold uppercase text-gray-500 text-center">Reach</TableHead>
            <TableHead className="text-[10px] font-bold uppercase text-gray-500">Evidence</TableHead>
            <TableHead className="text-[10px] font-bold uppercase text-gray-500">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-[11px] font-semibold text-gray-600">
                  {item.id}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">{item.activity}</span>
                    <span className="text-xs text-[#004B87] font-medium">{item.ip}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800">{item.district}</span>
                    <span className="text-[10px] text-gray-500">{item.province}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{item.totalParticipants}</span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      F:{item.femaleParticipants} | M:{item.maleParticipants}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.evidenceStatus === 'Approved' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : item.evidenceStatus === 'Pending' ? (
                      <FileText className="h-4 w-4 text-amber-500" />
                    ) : (
                      <FileWarning className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      item.evidenceStatus === 'Approved' ? 'text-green-700' :
                      item.evidenceStatus === 'Pending' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {item.evidenceStatus}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.validationStatus} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-medium">
                No data available for the selected filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
