<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

/**
 * @property int $id
 **/
class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Get the content of the message, showing placeholder if deleted
     */
    public function getDisplayContentAttribute(): string
    {
        return $this->trashed() ? '[deleted]' : $this->content;
    }

    public function report(int $user_id): Message
    {

        // Log the report action
        Log::info("Message ID {$this->id} reported by User ID {$user_id}");
        $this->status = 'reported';
        $this->save();

        return $this;
    }
}
