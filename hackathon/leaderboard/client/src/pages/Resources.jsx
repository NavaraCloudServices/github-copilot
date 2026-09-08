import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Book, Lightbulb } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Common/Card';

const Resources = ({ resources = [] }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Book className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h2 className="text-2xl font-bold text-navara-navy dark:text-white mb-2">
            No Resources Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Resources will be added soon to help you with the challenges.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navara-navy dark:text-white mb-2 flex items-center justify-center gap-2">
            <Lightbulb className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            Learning Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Helpful resources and documentation to guide you through the challenges. 
            Click on any resource to open it in a new tab.
          </p>
        </div>

        {/* Resources Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Available Resources ({resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold text-navara-navy dark:text-white">
                      Resource Name
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-navara-navy dark:text-white">
                      Link
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-navara-navy dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-navara-blue flex-shrink-0" />
                          <span className="font-medium text-navara-navy dark:text-white">
                            {resource.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600 dark:text-gray-400 font-mono text-sm break-all">
                          {resource.url}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-navara-blue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resource Cards for smaller screens */}
            <div className="md:hidden space-y-4 mt-6">
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <Book className="h-5 w-5 text-navara-blue flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-navara-navy dark:text-white mb-2">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all mb-3">
                        {resource.url}
                      </p>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-navara-blue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Resource
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card>
          <CardContent className="bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  💡 Pro Tips
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Bookmark helpful resources for quick reference during challenges</li>
                  <li>• Use these resources to learn new techniques and best practices</li>
                  <li>• All external links open in new tabs so you won't lose your progress</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Resources;
