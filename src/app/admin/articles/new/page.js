import ArticleForm from '@/components/admin/ArticleForm'

export const metadata = {
  title: 'New Article | SidCMS',
}

export default function NewArticlePage() {
  return (
    <div className="admin-content">
      <ArticleForm />
    </div>
  )
}
