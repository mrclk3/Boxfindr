import re

filepath = r'C:\Users\bySno\Desktop\ChestNewTemp\Boxfindr\frontend\src\app\(protected)\layout.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add mounted state
content = content.replace(
    'const [user, setUser] = React.useState<{ email: string, role: string } | null>(null)',
    'const [user, setUser] = React.useState<{ email: string, role: string } | null>(null)\n    const [mounted, setMounted] = React.useState(false)'
)

# Add setMounted(true) at end of useEffect
content = content.replace(
    '''            } else {
                // setIsAuthenticated(false) - removed
            }
        }
        checkAuth()
    }, [])''',
    '''            } else {
                // setIsAuthenticated(false) - removed
            }
            setMounted(true)
        }
        checkAuth()
    }, [])'''
)

# Wrap auth buttons with mounted check
content = content.replace(
    '{isAuthenticated && user ? (',
    '{mounted && (isAuthenticated && user ? ('
)

# Close the mounted check
content = content.replace(
    '''                    ) : (
                        <div className="text-sm text-muted-foreground">Logging in...</div>
                    )}''',
    '''                    ) : (
                        <div className="text-sm text-muted-foreground">Logging in...</div>
                    ))}'''
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ Fixed hydration error!')
