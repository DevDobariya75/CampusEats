import { motion } from 'framer-motion'
import { Zap, Users, Truck, Heart, Utensils, Clock, Shield, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HowItWorksPage() {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 dark:from-[#060B13] dark:via-[#0f1419] dark:to-[#1a1f2e] transition-colors duration-300">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.1),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(249,115,22,0.08),transparent_45%)]" />
        </div>

        {/* Header Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block p-4 bg-orange-100 dark:bg-orange-500/20 rounded-2xl mb-6 shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-orange-200 dark:border-orange-500/30">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Zap className="w-8 h-8 text-orange-500" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black font-display text-slate-900 dark:text-white mb-4 uppercase tracking-widest">
              How It Works
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto">
              Your Campus. Your Food. Your Choice. All within a few clicks.
            </p>
          </motion.div>
        </motion.section>

        {/* How It Works Steps */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-black font-display text-center text-slate-900 dark:text-white mb-16 uppercase tracking-widest"
            >
              Simple 3 Steps to Satisfaction
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <motion.div variants={itemVariants} className="group">
                <div className="h-full bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Browse & Order</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    Explore delicious food from your favorite campus shops. Browse menus, check ratings, and place your order instantly.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={itemVariants} className="group">
                <div className="h-full bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Real-Time Tracking</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    Track your order in real-time. Know exactly when your food is being prepared and delivered to your doorstep.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={itemVariants} className="group">
                <div className="h-full bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Enjoy & Repeat</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    Enjoy your meal and share your experience. Rate your order and save your favorites for next time.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-black font-display text-center text-slate-900 dark:text-white mb-16 uppercase tracking-widest"
            >
              Why Choose CampusEats?
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Get your food in minutes, not hours' },
                { icon: MapPin, title: 'Campus Delivery', desc: 'Delivered right to your campus location' },
                { icon: Shield, title: 'Secure Payments', desc: 'Multiple payment options with complete security' },
                { icon: Users, title: 'Trusted Shops', desc: 'Verified vendors with quality assurance' },
              ].map((feature, i) => (
                <motion.div key={i} variants={itemVariants} className="group">
                  <div className="bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 font-bold">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-orange-600 dark:via-orange-500 dark:to-orange-700 rounded-3xl p-12 text-white shadow-2xl"
            >
              <h2 className="text-4xl font-black font-display mb-6 uppercase tracking-widest">Our Vision</h2>
              <p className="text-lg leading-relaxed font-bold text-white/95 mb-6">
                At CampusEats, we believe that every student deserves convenient, affordable, and delicious food. Our mission is to revolutionize campus dining by connecting hungry students with the best local vendors and delivery partners.
              </p>
              <p className="text-lg leading-relaxed font-bold text-white/95">
                We're building a community where food delivery is not just a service, but a lifestyle. From morning coffee to midnight snacks, CampusEats is here to fuel your campus life with every meal you need.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-black font-display text-center text-slate-900 dark:text-white mb-12 uppercase tracking-widest"
            >
              About CampusEats
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Our Story</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    CampusEats was born from a simple idea: making student life easier. We started as a small platform to connect campus vendors with hungry students, and today we're proud to serve thousands of daily orders across multiple campuses.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Our Values</h3>
                  <ul className="space-y-2">
                    {['Quality & Freshness', 'Speed & Reliability', 'Community First', 'Transparency', 'Innovation'].map((value, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                {[
                  { number: '10K+', label: 'Daily Orders' },
                  { number: '500+', label: 'Partner Shops' },
                  { number: '100+', label: 'Delivery Partners' },
                  { number: '4.8★', label: 'Average Rating' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl p-6 text-center text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="text-3xl font-black mb-2">{stat.number}</div>
                    <div className="font-bold text-orange-100 text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Featured Foods Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-black font-display text-center text-slate-900 dark:text-white mb-16 uppercase tracking-widest"
            >
              Featured Food Items
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Pizzas', emoji: '🍕', desc: 'Fresh & Hot' },
                { name: 'Burgers', emoji: '🍔', desc: 'Juicy & Delicious' },
                { name: 'Cookies', emoji: '🍪', desc: 'Sweet Treats' },
                { name: 'Burritos', emoji: '🌯', desc: 'Filling Meals' },
                { name: 'Beverages', emoji: '☕', desc: 'Hot & Cold' },
                { name: 'Desserts', emoji: '🍰', desc: 'Tempting Flavors' },
              ].map((food, i) => (
                <motion.div key={i} variants={itemVariants} className="group">
                  <div className="bg-white/80 dark:bg-[#0b1320]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all text-center hover:-translate-y-2">
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">{food.emoji}</div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">{food.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-bold">{food.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-black font-display text-slate-900 dark:text-white mb-6 uppercase tracking-widest">
                Ready to Taste the Difference?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-bold mb-8">
                Join thousands of students enjoying convenient campus dining. Order your favorite food now!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-widest text-lg"
              >
                Start Ordering Now
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* Creator Credits Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/10"
        >
          <div className="max-w-4xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-black font-display text-center text-slate-900 dark:text-white mb-12 uppercase tracking-widest"
            >
              Developed By
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Dev Dobariya'
                },
                {
                  name: 'Manthan Dadhania'
                },
              ].map((creator, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-500/10 dark:to-[#0b1320] border-2 border-orange-200 dark:border-orange-500/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{creator.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                      {creator.name}
                    </h3>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-widest">
                      {creator.role}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-bold mb-4">{creator.desc}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-12 text-center p-8 bg-white/50 dark:bg-[#0b1320]/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl"
            >
              <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">
                Built with passion to make campus dining better. © 2024 CampusEats. All rights reserved.
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
  )
}
