<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'email_verified_at', 'role', 'google_id', 'avatar', 'rating', 'posts'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmailContract
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, MustVerifyEmail, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'rating' => 'decimal:2',
            'posts' => 'integer',
        ];
    }

    public function profile()
    {
        return $this->hasOne(\App\Models\Profile::class);
    }

    /**
     * The posts this user has created.
     */
    public function opportunities()
    {
        return $this->hasMany(\App\Models\Opportunity::class);
    }

    /**
     * The live post count, computed rather than read from the cached
     * `posts` column, so it can never drift out of sync with the posts table.
     */
    public function postsCount(): int
    {
        return $this->opportunities()->count();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
