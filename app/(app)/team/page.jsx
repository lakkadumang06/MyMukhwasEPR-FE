'use client';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { AutoForm } from '@/components/form/AutoForm';
import { Money, StatusBadge } from '@/components/common/widgets';
import { Button, Card, Input, Label, Select } from '@/components/ui';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useList, useCreate, useUpdate, useRemove, useGet, useRawMutation } from '@/lib/useCrud';
import { date } from '@/lib/format';

const WRITE_ROLES = ['manager'];
const STATUSES = ['Present', 'Absent', 'Half-Day', 'Leave'];

const EMPLOYEE_FIELDS = [
  { name: 'name', label: 'Name', required: true, half: true },
  { name: 'role', label: 'Role', half: true },
  { name: 'phone', label: 'Phone', half: true },
  { name: 'monthlySalary', label: 'Monthly Salary', type: 'number', half: true },
];

function EmployeesSection({ writable }) {
  const { data, isLoading, error } = useList('/team/employees');
  const create = useCreate('/team/employees');
  const update = useUpdate('/team/employees');
  const remove = useRemove('/team/employees');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = Array.isArray(data) ? data : data?.items || [];

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editing) {
      await update.mutateAsync({ id: editing._id, body: values });
    } else {
      await create.mutateAsync(values);
    }
    setOpen(false);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this Employee?')) {
      await remove.mutateAsync(row._id);
    }
  };

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Employees</h2>
        {writable ? (
          <Button onClick={openNew}>
            <Plus size={16} /> New
          </Button>
        ) : null}
      </div>

      <DataTable
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'role', header: 'Role' },
          { key: 'phone', header: 'Phone' },
          {
            key: 'monthlySalary',
            header: 'Monthly Salary',
            align: 'right',
            render: (row) => <Money value={row.monthlySalary} />,
          },
        ]}
        data={rows}
        isLoading={isLoading}
        error={error}
        searchKeys={['name', 'role', 'phone']}
        actions={
          writable
            ? (row) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                    <Pencil size={15} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
                    <Trash2 size={15} className="text-danger" />
                  </Button>
                </div>
              )
            : undefined
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Employee' : 'New Employee'}
      >
        <AutoForm
          fields={EMPLOYEE_FIELDS}
          defaultValues={editing || {}}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </section>
  );
}

function AttendanceSection() {
  const { data: empData } = useList('/team/employees');
  const employees = Array.isArray(empData) ? empData : empData?.items || [];

  const [employee, setEmployee] = useState('');
  const [day, setDay] = useState('');
  const [status, setStatus] = useState('Present');

  const { data, isLoading, error } = useGet('/team/attendance');
  const rows = Array.isArray(data) ? data : data?.items || [];

  const mark = useRawMutation();
  const saving = mark.isPending;

  const handleMark = async (e) => {
    e.preventDefault();
    if (!employee || !day) {
      toast.error('Select employee and date');
      return;
    }
    try {
      await mark.trigger({
        url: '/team/attendance',
        method: 'post',
        body: { employee, date: day, status },
        invalidates: [{ type: 'Raw', id: '/team/attendance' }],
      });
      toast.success('Attendance marked');
      setEmployee('');
      setDay('');
      setStatus('Present');
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    }
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-800">Attendance</h2>

      <Card className="mb-5 p-4">
        <form onSubmit={handleMark} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <Label className="mb-1 block">Employee</Label>
            <Select value={employee} onChange={(e) => setEmployee(e.target.value)}>
              <option value="">— select —</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Date</Label>
            <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving…' : 'Mark Attendance'}
            </Button>
          </div>
        </form>
      </Card>

      <DataTable
        columns={[
          { key: 'employee', header: 'Employee', render: (row) => row.employee?.name },
          { key: 'date', header: 'Date', render: (row) => date(row.date) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ]}
        data={rows}
        isLoading={isLoading}
        error={error}
        emptyLabel="No attendance records yet"
      />
    </section>
  );
}

export default function TeamPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, WRITE_ROLES);

  return (
    <div>
      <PageHeader title="Team & Attendance" subtitle="Employees and daily attendance" />
      <EmployeesSection writable={writable} />
      <AttendanceSection />
    </div>
  );
}
