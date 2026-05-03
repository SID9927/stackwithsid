import InterviewForm from '@/components/admin/InterviewForm'

export const metadata = {
  title: 'Add New Question | SidCMS',
}

export default function NewInterviewPage() {
  return (
    <div className="admin-content">
      <InterviewForm />
    </div>
  )
}
