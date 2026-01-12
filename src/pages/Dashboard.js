import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalls, deleteCall } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Upload, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadCalls = async () => {
    try {
      const data = await getCalls();
      setCalls(data.calls || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load calls:', err);
      setError('Failed to load calls. Make sure backend is running.');
      toast.error('Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (callId, event) => {
    event?.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this call? This action cannot be undone.')) {
      return;
    }

    setDeletingId(callId);
    try {
      await deleteCall(callId);
      toast.success('Call deleted successfully');
      loadCalls();
    } catch (err) {
      console.error('Failed to delete call:', err);
      toast.error('Failed to delete call');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      uploaded: 'bg-blue-100 text-blue-800',
      transcribing: 'bg-yellow-100 text-yellow-800',
      transcribed: 'bg-purple-100 text-purple-800',
      processing: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleRowClick = (callId) => {
    navigate(`/call/${callId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading calls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Call Quality Dashboard</h1>
        <Button onClick={() => navigate('/upload')}>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Call
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      {calls.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No calls yet</h2>
            <p className="text-muted-foreground mb-4">
              Upload your first call recording to get started!
            </p>
            <Button onClick={() => navigate('/upload')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Call
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map((call) => (
                    <TableRow
                      key={call.id}
                      onClick={() => handleRowClick(call.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {call.original_filename || call.filename || 'Untitled'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(call.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(call.file_size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {call.score_count || 0}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDelete(call.id, e)}
                              disabled={deletingId === call.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
